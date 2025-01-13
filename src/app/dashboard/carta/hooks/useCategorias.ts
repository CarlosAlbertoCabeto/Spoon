// src/app/dashboard/carta/hooks/useCategorias.ts
import { useState, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/types/collections.types';
import { ICategoriaMenu } from '@/firebase/types/collections.types';

interface Categoria extends Omit<ICategoriaMenu, 'id'> {
  id: string;
  descripcion?: string;
  horarios?: {
    inicio: string;
    fin: string;
    dias: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  activo: boolean;
}

interface UseCategoriasProps {
  restauranteId: string;
}

export function useCategorias({ restauranteId }: UseCategoriasProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('RestauranteId usado:', restauranteId); // Log 1

      const categoriasRef = collection(db, COLLECTIONS.CATEGORIAS_MENU);
      const q = query(
        categoriasRef, 
        where('restauranteId', '==', restauranteId),
        where('disponible', '==', true)
      );
      
      console.log('Query creada, intentando obtener documentos...'); // Log 2
      const querySnapshot = await getDocs(q);
      console.log('Documentos encontrados:', querySnapshot.size); // Log 3
      console.log('Documentos raw:', querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Log 4

      const categoriasData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre,
          tipo: data.tipo,
          orden: data.orden,
          restauranteId: data.restauranteId,
          activo: data.disponible,
          descripcion: data.descripcion || '',
          horarios: data.horarios || null,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Categoria;
      });

      console.log('Categorias procesadas:', categoriasData); // Log 5
  
      // Mantener el ordenamiento
      const categoriasOrdenadas = categoriasData.sort((a, b) => {
        if (a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        return a.nombre.localeCompare(b.nombre);
      });
  
      setCategorias(categoriasOrdenadas);
      return categoriasOrdenadas;
    } catch (err) {
      const errorMsg = 'Error al cargar las categorías';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [restauranteId]);

  const agregarCategoria = useCallback(async (datos: Omit<Categoria, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      // Preparar datos para Firestore siguiendo ICategoriaMenu
      const categoriaData = {
        nombre: datos.nombre,
        tipo: datos.tipo,
        restauranteId,
        orden: datos.orden || (categorias.length + 1) * 10,
        disponible: true, // En lugar de activo
        descripcion: datos.descripcion || '',
        horarios: datos.horarios || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
  
      const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIAS_MENU), categoriaData);
      
      // Transformar de vuelta a nuestro formato local
      const nuevaCategoria: Categoria = {
        id: docRef.id,
        ...datos,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        restauranteId
      };
      
      setCategorias(prev => {
        const nuevasCategorias = [...prev, nuevaCategoria];
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return nuevaCategoria;
    } catch (err) {
      const errorMsg = 'Error al crear la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [categorias.length, restauranteId]);

  const actualizarCategoria = useCallback(async (id: string, datos: Partial<Categoria>) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, COLLECTIONS.CATEGORIAS_MENU, id);
      
      // Preparar datos para Firestore
      const datosActualizados = {
        ...datos,
        disponible: datos.activo, // Mapear activo a disponible
        updatedAt: new Date()
      };
  
      // Eliminar campos que no queremos enviar a Firestore
      delete datosActualizados.activo; // Eliminamos porque ya lo mapeamos a disponible
      delete datosActualizados.id; // No necesitamos enviar el id
  
      await updateDoc(docRef, datosActualizados);
  
      // Actualizar estado local
      setCategorias(prev => {
        const nuevasCategorias = prev.map(cat => 
          cat.id === id 
            ? { 
                ...cat, 
                ...datos, 
                updatedAt: new Date() 
              } 
            : cat
        );
        return nuevasCategorias.sort((a, b) => {
          if (a.orden !== undefined && b.orden !== undefined) {
            return a.orden - b.orden;
          }
          return a.nombre.localeCompare(b.nombre);
        });
      });
  
      return { id, ...datos, updatedAt: new Date() };
    } catch (err) {
      const errorMsg = 'Error al actualizar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarCategoria = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, COLLECTIONS.CATEGORIAS_MENU, id);
      // Soft delete - marcar como no disponible en lugar de eliminar
      await updateDoc(docRef, {
        disponible: false,
        updatedAt: new Date()
      });
  
      // Actualizar estado local
      setCategorias(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      const errorMsg = 'Error al eliminar la categoría';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorias,
    loading,
    error,
    obtenerCategorias,
    agregarCategoria,
    actualizarCategoria,
    eliminarCategoria
  };
}