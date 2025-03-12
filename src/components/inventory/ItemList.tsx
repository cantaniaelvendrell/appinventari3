'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ItemForm } from './ItemForm';
import { ItemLocationForm } from './ItemLocationForm';
import Link from 'next/link';

interface Item {
  id: string;
  name: string;
  model: string;
  family_id: string;
  subfamily_id: string;
  usage: 'internal' | 'external';
  image_url: string | null;
  observations: string | null;
  created_at: string;
  en_prestec: string | null;
  family: {
    name: string;
  };
  subfamily: {
    name: string;
  };
  item_locations: {
    location: {
      name: string;
    };
    quantity: number;
  }[];
}

export function ItemList({ limit = 3 }) {
  const [items, setItems] = useState<Item[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      console.log('Iniciando fetchItems...');
      const { data, error } = await supabase
        .from('items')
        .select(`
          id,
          name,
          model,
          family_id,
          subfamily_id,
          usage,
          image_url,
          observations,
          created_at,
          en_prestec,
          families!items_family_id_fkey(name),
          subfamilies!items_subfamily_id_fkey(name),
          item_locations(
            quantity,
            locations(name)
          )
        `)
        .limit(limit);

      if (error) {
        console.error('Error al cargar los items:', error);
        throw error;
      }

      // Transformar los datos para mantener la estructura esperada
      const transformedData = (data || []).map((item: any): Item => ({
        id: item.id,
        name: item.name,
        model: item.model,
        family_id: item.family_id,
        subfamily_id: item.subfamily_id,
        usage: item.usage,
        image_url: item.image_url,
        observations: item.observations,
        created_at: item.created_at,
        en_prestec: item.en_prestec,
        family: {
          name: item.families?.name || 'Sin familia'
        },
        subfamily: {
          name: item.subfamilies?.name || 'Sin subfamilia'
        },
        item_locations: (item.item_locations || []).map((il: any) => ({
          location: {
            name: il.locations?.name || 'Sin ubicación'
          },
          quantity: il.quantity || 0
        }))
      }));

      console.log('Items transformados:', transformedData);
      setItems(transformedData || []);
    } catch (error) {
      console.error('Error detallado al cargar los items:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
      }
      console.error('Propiedades del error:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este item?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchItems();
    } catch (error) {
      console.error('Error al eliminar el item:', error);
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleLocation = (item: Item) => {
    setSelectedItem(item);
    setIsLocationFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-xl">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl md:text-2xl font-bold text-gray-900 text-lg">Inventario</h2>
        <div className="flex space-x-4 items-center">
          <button
            onClick={() => {
              setSelectedItem(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4 md:h-5 md:w-5" />
            Nou Item
          </button>
          {limit === 3 && (
            <Link
              href="/dashboard/inventory"
              className="text-xs md:text-sm text-indigo-600 hover:text-indigo-900"
            >
              Veure tots
            </Link>
          )}
        </div>
      </div>

      {isFormOpen && (
        <ItemForm
          item={selectedItem}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedItem(null);
          }}
          onSave={fetchItems}
        />
      )}

      {isLocationFormOpen && selectedItem && (
        <ItemLocationForm
          item={selectedItem}
          onClose={() => {
            setIsLocationFormOpen(false);
            setSelectedItem(null);
          }}
          onSave={fetchItems}
        />
      )}

      <div className="overflow-x-auto shadow-md rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Família
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subfamília
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ús
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En préstec
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantitat
                  </th>
                  <th scope="col" className="px-3 py-2 md:px-6 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">{item.model}</div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">{item.family?.name}</div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">{item.subfamily?.name}</div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.usage === 'internal' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.usage === 'internal' ? 'Interno' : 'Externo'}
                      </span>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">
                        {item.en_prestec || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm text-gray-900">
                        {item.item_locations?.map(il => (
                          <div key={il.location.name}>
                            {il.location.name}: {il.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 md:px-6 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleLocation(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <MapPinIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <PencilIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-2 md:px-6 md:py-4 text-center text-xs md:text-sm text-gray-500">
                      No hay items registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 