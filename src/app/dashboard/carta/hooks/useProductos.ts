import { useState, useCallback } from 'react';
import { COLLECTIONS } from '@/firebase/types/collections.types';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  orderBy, 
  limit, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { 
  VersionedProduct, 
  ProductVersion, 
  ProductStock, 
  PriceHistory 
} from '@/app/dashboard/carta/types/product-versioning.types';

interface UseProductosProps {
  restauranteId: string;
  categoriaId?: string;
}

export function useProductos({ restauranteId, categoriaId }: UseProductosProps) {
  const [productos, setProductos] = useState<VersionedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener productos
  const obtenerProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productosRef = collection(db, COLLECTIONS.PRODUCTOS);
      let q = query(
        productosRef,
        where('restauranteId', '==', restauranteId),
        where('estado', '==', 'disponible')
      );
  
      if (categoriaId) {
        q = query(q, where('categoriaId', '==', categoriaId));
      }

      const querySnapshot = await getDocs(q);
      const productosData: VersionedProduct[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const producto: VersionedProduct = {
          id: docSnap.id,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: data.precio,
          categoriaId: data.categoriaId,
          imagen: data.imagen,
          costo: data.costo,
          etiquetas: data.etiquetas || [],
          currentVersion: 1,
          currentPrice: data.precio || 0,
          priceHistory: [],
          versions: [],
          status: data.estado === 'disponible' ? 'active' : 'archived',
          stock: {
            currentQuantity: data.stock?.actual || 0,
            minQuantity: data.stock?.minimo || 0,
            maxQuantity: data.stock?.maximo || 100,
            status: data.estado === 'disponible' ? 'in_stock' : 'out_of_stock',
            lastUpdated: data.metadata?.lastModified?.toDate() || new Date(),
            alerts: {
              lowStock: false,
              overStock: false,
              thresholds: {
                low: 10,
                high: 90
              }
            }
          },
          metadata: {
            createdAt: data.metadata?.createdAt?.toDate() || new Date(),
            createdBy: data.metadata?.createdBy || '',
            lastModified: data.metadata?.lastModified?.toDate() || new Date(),
            lastModifiedBy: data.metadata?.lastModifiedBy || ''
          },
          restauranteId: data.restauranteId
        };
        productosData.push(producto);
      }

      setProductos(productosData);
      return productosData;
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId, categoriaId]);

  // Agregar producto
  const agregarProducto = useCallback(async (
    producto: Omit<VersionedProduct, 'id' | 'currentVersion' | 'versions' | 'priceHistory'>, 
    imagen?: File
  ) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
  
    try {
      const productoRef = doc(collection(db, COLLECTIONS.PRODUCTOS));
      const timestamp = serverTimestamp();
      let imagenUrl: string | undefined;
  
      if (imagen) {
        const storageRef = ref(storage, `productos/${restauranteId}/${productoRef.id}/${imagen.name}`);
        await uploadBytes(storageRef, imagen);
        imagenUrl = await getDownloadURL(storageRef);
      }
  
      // Preparar datos según la estructura de IProducto
      const productoData = {
        id: productoRef.id,
        restauranteId,
        categoriaId: producto.categoriaId,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagen: imagenUrl || '',
        precio: producto.currentPrice,
        costo: producto.costo || 0,
        etiquetas: producto.etiquetas || [],
        stock: {
          actual: 0,
          minimo: 0,
          unidad: 'unidad'
        },
        estado: 'disponible',
        metadata: {
          createdAt: timestamp,
          lastModified: timestamp,
          createdBy: 'current-user',
          lastModifiedBy: 'current-user'
        }
      };
  
      batch.set(productoRef, productoData);
      await batch.commit();
  
      // Convertir a formato VersionedProduct para el estado local
      const nuevoProducto: VersionedProduct = {
        ...productoData,
        currentVersion: 1,
        currentPrice: producto.currentPrice || 0,
        priceHistory: [],
        versions: [],
        status: 'active',
        stock: {
          currentQuantity: 0,
          minQuantity: 0,
          maxQuantity: 100,
          status: 'in_stock',
          lastUpdated: new Date(),
          alerts: {
            lowStock: false,
            overStock: false,
            thresholds: {
              low: 10,
              high: 90
            }
          }
        },
        metadata: {
          createdAt: new Date(),
          createdBy: 'current-user',
          lastModified: new Date(),
          lastModifiedBy: 'current-user'
        }
      };
  
      setProductos(prev => [...prev, nuevoProducto]);
      return nuevoProducto;
  
    } catch (err) {
      setError('Error al crear el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  // Actualizar producto
  const actualizarProducto = useCallback(async (
    id: string, 
    datos: Partial<VersionedProduct>, 
    imagen?: File
  ) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
  
    try {
      const productoRef = doc(db, COLLECTIONS.PRODUCTOS, id);
      let imagenUrl: string | undefined;
  
      if (imagen) {
        const storageRef = ref(storage, `productos/${restauranteId}/${id}/${imagen.name}`);
        await uploadBytes(storageRef, imagen);
        imagenUrl = await getDownloadURL(storageRef);
      }
  
      // Preparar datos para Firestore según IProducto
      const actualizacion = {
        ...(datos.nombre && { nombre: datos.nombre }),
        ...(datos.descripcion && { descripcion: datos.descripcion }),
        ...(datos.currentPrice && { precio: datos.currentPrice }),
        ...(datos.categoriaId && { categoriaId: datos.categoriaId }),
        ...(imagenUrl && { imagen: imagenUrl }),
        ...(datos.costo && { costo: datos.costo }),
        ...(datos.etiquetas && { etiquetas: datos.etiquetas }),
        ...(datos.stock && {
          stock: {
            actual: datos.stock.currentQuantity,
            minimo: datos.stock.minQuantity,
            unidad: 'unidad'
          }
        }),
        metadata: {
          lastModified: serverTimestamp(),
          lastModifiedBy: 'current-user'
        }
      };
  
      batch.update(productoRef, actualizacion);
      await batch.commit();
  
      // Actualizar estado local
      setProductos(prev =>
        prev.map(prod =>
          prod.id === id
            ? {
                ...prod,
                ...datos,
                ...(imagenUrl && { imagen: imagenUrl }),
                metadata: {
                  ...prod.metadata,
                  lastModified: new Date(),
                  lastModifiedBy: 'current-user'
                }
              }
            : prod
        )
      );
    } catch (err) {
      setError('Error al actualizar el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  // Eliminar producto
  const eliminarProducto = useCallback(async (id: string, imagenUrl?: string) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
  
    try {
      // Eliminar imagen si existe
      if (imagenUrl) {
        const imageRef = ref(storage, imagenUrl);
        try {
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error al eliminar imagen:', error);
          // Continuamos aunque falle la eliminación de la imagen
        }
      }
  
      // Actualizar estado en Firestore (soft delete)
      const productoRef = doc(db, COLLECTIONS.PRODUCTOS, id);
      batch.update(productoRef, { 
        estado: 'inactivo',
        metadata: {
          lastModified: serverTimestamp(),
          lastModifiedBy: 'current-user'
        }
      });
  
      await batch.commit();
  
      // Actualizar estado local
      setProductos(prev => prev.filter(prod => prod.id !== id));
  
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); 

  return {
    productos,
    loading,
    error,
    obtenerProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto
  };
}
