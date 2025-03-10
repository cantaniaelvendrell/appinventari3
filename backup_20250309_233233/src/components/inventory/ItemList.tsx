'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusIcon, PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ItemForm } from './ItemForm';
import { ItemLocationForm } from './ItemLocationForm';

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

export function ItemList() {
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
          families!items_family_id_fkey(name),
          subfamilies!items_subfamily_id_fkey(name),
          item_locations(
            quantity,
            locations(name)
          )
        `)
        .order('name');

      if (error) {
        console.error('Error al cargar los items:', error);
        throw error;
      }

      // Transformar los datos para mantener la estructura esperada
      const transformedData = data?.map(item => ({
        ...item,
        family: item.families,
        subfamily: item.subfamilies,
        item_locations: item.item_locations?.map(il => ({
          ...il,
          location: il.locations
        }))
      }));

      console.log('Items cargados:', transformedData);
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
        <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Nuevo Item
        </button>
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

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Familia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subfamilia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uso
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidades
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.family?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.subfamily?.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.usage === 'internal' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.usage === 'internal' ? 'Interno' : 'Externo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.item_locations?.map(il => (
                      <div key={il.location.name}>
                        {il.location.name}: {il.quantity}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleLocation(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <MapPinIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay items registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 