'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Subfamily {
  id: string;
  name: string;
  family_id: string;
  created_at: string;
}

interface SubfamilyListProps {
  familyId: string;
}

export function SubfamilyList({ familyId }: SubfamilyListProps) {
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubfamily, setSelectedSubfamily] = useState<Subfamily | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubfamilies();
  }, [familyId]);

  const fetchSubfamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('subfamilies')
        .select('*')
        .eq('family_id', familyId)
        .order('name');

      if (error) throw error;
      setSubfamilies(data || []);
    } catch (error) {
      console.error('Error al cargar las subfamilias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta subfamilia?')) return;

    try {
      const { error } = await supabase
        .from('subfamilies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSubfamilies();
    } catch (error) {
      console.error('Error al eliminar la subfamilia:', error);
    }
  };

  const handleEdit = (subfamily: Subfamily) => {
    setSelectedSubfamily(subfamily);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="text-sm">Carregant subfamílies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Subfamílies</h3>
        <button
          onClick={() => {
            setSelectedSubfamily(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          Nova Subfamília
        </button>
      </div>
      {isFormOpen && (
        <SubfamilyForm
          subfamily={selectedSubfamily}
          familyId={familyId}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedSubfamily(null);
          }}
          onSave={fetchSubfamilies}
        />
      )}

      <div className="bg-gray-50 rounded-md">
        <ul className="divide-y divide-gray-200">
          {subfamilies.map((subfamily) => (
            <li key={subfamily.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {subfamily.name}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subfamily)}
                    className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(subfamily.id)}
                    className="inline-flex items-center p-1 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {subfamilies.length === 0 && (
            <li className="px-4 py-3 text-center text-gray-500">
              No hi ha subfamílies registrades
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 