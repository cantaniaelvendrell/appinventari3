'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { LocationList } from '@/components/locations/LocationList';
import { FamilyList } from '@/components/families/FamilyList';
import { ItemList } from '@/components/inventory/ItemList';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('Obteniendo información del usuario...');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Usuario autenticado:', user.email);
          // Obtener el rol del usuario desde la base de datos
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error('Error al obtener el rol del usuario:', userError);
            throw userError;
          }

          console.log('Rol del usuario:', userData?.role);
          setUser({
            id: user.id,
            email: user.email!,
            role: userData?.role || 'user'
          });
        } else {
          console.log('No hay usuario autenticado');
        }
      } catch (error) {
        console.error('Error detallado al obtener el usuario:', error);
        if (error instanceof Error) {
          console.error('Mensaje de error:', error.message);
        }
        console.error('Propiedades del error:', JSON.stringify(error, null, 2));
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {user?.role === 'admin' ? (
                <div className="space-y-6">
                  <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                      <ItemList />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                      <div className="p-6">
                        <LocationList />
                      </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                      <div className="p-6">
                        <FamilyList />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Panel de Usuario</h2>
                    <p>Bienvenido al sistema de gestión de inventario.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 