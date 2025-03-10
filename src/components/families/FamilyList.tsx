'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { FamilyForm } from '@/components/families/FamilyForm';
import { SubfamilyList } from '@/components/families/SubfamilyList';

interface Family {
  id: string;
  name: string;
  created_at: string;
}

export function FamilyList() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('FamilyList montado - Cargando familias...');
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      console.log('Obteniendo lista de familias...');
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error al obtener familias:', error);
        throw error;
      }
      
      console.log('Familias obtenidas:', data);
      setFamilies(data || []);
    } catch (error) {
      console.error('Error al cargar las familias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta familia? Se eliminarán también todas sus subfamilias.')) return;

    try {
      console.log('Eliminando familia:', id);
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar familia:', error);
        throw error;
      }
      
      console.log('Familia eliminada correctamente');
      await fetchFamilies();
    } catch (error) {
      console.error('Error al eliminar la familia:', error);
    }
  };

  const handleEdit = (family: Family) => {
    console.log('Editando familia:', family);
    setSelectedFamily(family);
    setIsFormOpen(true);
  };

  const toggleExpand = (familyId: string) => {
    setExpandedFamily(expandedFamily === familyId ? null : familyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-xl">Carregant famílies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Famílies</h2>
        <button
          onClick={() => {
            console.log('Abriendo formulario para nueva familia');
            setSelectedFamily(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Nova Família
        </button>
      </div>

      {isFormOpen && (
        <FamilyForm
          family={selectedFamily}
          onClose={() => {
            console.log('Cerrando formulario de familia');
            setIsFormOpen(false);
            setSelectedFamily(null);
          }}
          onSave={() => {
            console.log('Familia guardada - Actualizando lista');
            fetchFamilies();
          }}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {families.map((family) => (
            <li key={family.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleExpand(family.id)}
                      className="flex items-center text-lg font-medium text-gray-900 hover:text-indigo-600"
                    >
                      <ChevronDownIcon
                        className={`h-5 w-5 mr-2 transform transition-transform ${
                          expandedFamily === family.id ? 'rotate-180' : ''
                        }`}
                      />
                      {family.name}
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(family)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(family.id)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expandedFamily === family.id && (
                  <div className="mt-4 ml-7">
                    <SubfamilyList familyId={family.id} />
                  </div>
                )}
              </div>
            </li>
          ))}
          {families.length === 0 && (
            <li className="px-4 py-6 text-center text-gray-500">
              No hi ha famílies registrades
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 