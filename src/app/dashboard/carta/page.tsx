// src/app/dashboard/carta/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { MenuLayout } from './components/layout/MenuLayout';
import { useCategorias } from './hooks/useCategorias';
import { useProductos } from './hooks/useProductos';
import { VersionedProduct } from './types/product-versioning.types';
import { Categoria, CategoriaMenu } from './types/menu.types';
import { useAuth } from '@/context/authcontext';

export default function CartaPage() {
  console.log('Renderizando CartaPage'); // Log inicial de renderizado

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<VersionedProduct[]>([]);

  const { sessionInfo, usuario, cargando } = useAuth();
  console.log('Auth Details:', {
    usuario: usuario ? { 
      uid: usuario.uid, 
      email: usuario.email 
    } : null,
    sessionInfo: sessionInfo ? {
      restaurantId: sessionInfo.restaurantId,
      role: sessionInfo.role
    } : null,
    cargando
  });

  const restauranteId = sessionInfo?.restaurantId || '';
  console.log('restauranteId:', restauranteId); // Log del ID del restaurante

  const { obtenerCategorias, agregarCategoria } = useCategorias({ restauranteId });
  const { obtenerProductos } = useProductos({ restauranteId });

  useEffect(() => {
    console.log('useEffect iniciado'); // Log de inicio del efecto
    console.log('Estado actual - isLoading:', isLoading);
    console.log('Estado actual - error:', error);
    console.log('Estado actual - categorias:', categorias);
    console.log('Estado actual - productos:', productos);
    console.log('restauranteId en useEffect:', restauranteId);

    if (!restauranteId) {
      console.log('No hay restauranteId, saliendo del efecto');
      return;
    }

    const cargarDatos = async () => {
      console.log('=== Iniciando carga de datos ===');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Intentando cargar categorías y productos...');
        const [categoriasData, productosData] = await Promise.all([
          obtenerCategorias(),
          obtenerProductos()
        ]);
        console.log('Datos obtenidos - categorías:', categoriasData);
        console.log('Datos obtenidos - productos:', productosData);

        if (categoriasData.length === 0) {
          console.log('No hay categorías, creando categorías iniciales...');
          const categoriasIniciales = [
            { nombre: 'Entradas', tipo: CategoriaMenu.ENTRADA, orden: 1 },
            { nombre: 'Principios', tipo: CategoriaMenu.PRINCIPIO, orden: 2 },
            { nombre: 'Proteínas', tipo: CategoriaMenu.PROTEINA, orden: 3 },
            { nombre: 'Acompañamientos', tipo: CategoriaMenu.ACOMPANAMIENTO, orden: 4 },
            { nombre: 'Bebidas', tipo: CategoriaMenu.BEBIDA, orden: 5 }
          ];

          console.log('Categorías iniciales a crear:', categoriasIniciales);

          const promesasCategorias = categoriasIniciales.map(cat => 
            agregarCategoria({
              nombre: cat.nombre,
              tipo: cat.tipo,
              orden: cat.orden,
              restauranteId: restauranteId,
              disponible: true,
              activo: true,
              descripcion: '',
              createdAt: new Date(),
              updatedAt: new Date(),
              horarios: undefined,
              productos: []
            })
          );

          try {
            console.log('Intentando crear categorías iniciales...');
            const nuevasCategorias = await Promise.all(promesasCategorias);
            console.log('Categorías iniciales creadas:', nuevasCategorias);

            const categoriasConProductos = nuevasCategorias.map(cat => ({
              id: cat.id,
              nombre: cat.nombre,
              productos: [],
              restauranteId: cat.restauranteId,
              activo: cat.disponible,
              orden: cat.orden,
              createdAt: new Date(),
              updatedAt: new Date()
            })) as Categoria[];

            console.log('Categorías procesadas:', categoriasConProductos);
            setCategorias(categoriasConProductos);
          } catch (error) {
            console.error('Error al crear categorías iniciales:', error);
            throw error;
          }
        } else {
          console.log('Procesando categorías existentes...');
          const categoriasCompletas = categoriasData.map(cat => ({
            id: cat.id,
            nombre: cat.nombre,
            productos: [],
            restauranteId: cat.restauranteId,
            activo: cat.disponible,
            orden: cat.orden,
            createdAt: cat.createdAt || new Date(),
            updatedAt: cat.updatedAt || new Date(),
            horarios: cat.horarios ? {
              dias: cat.horarios.dias,
              rangos: [],
              excepciones: [],
              activo: true
            } : undefined
          })) as Categoria[];

          console.log('Categorías existentes procesadas:', categoriasCompletas);
          setCategorias(categoriasCompletas);
        }

        setProductos(productosData);
        console.log('Productos establecidos:', productosData);

      } catch (error) {
        console.error('Error detallado:', error);
        const mensajeError = error instanceof Error ? error.message : 'Error al cargar los datos';
        setError(mensajeError);
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
        console.log('Carga de datos finalizada');
      }
    };

    cargarDatos();
  }, [restauranteId, obtenerCategorias, obtenerProductos, agregarCategoria]);

  console.log('Antes del render - categorias:', categorias);
  console.log('Antes del render - productos:', productos);

  return (
    <MenuLayout 
      isLoading={isLoading}
      error={error}
      categorias={categorias}
      productos={productos}
      restauranteId={restauranteId}
      onCategoriaCreated={(newCategoria) => {
        console.log('Nueva categoría a crear:', newCategoria);
        const categoriaConProductos: Categoria = {
          ...newCategoria,
          productos: [],
          activo: newCategoria.disponible,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        console.log('Categoría procesada:', categoriaConProductos);
        setCategorias([...categorias, categoriaConProductos]);
      }}
    />
  );
}