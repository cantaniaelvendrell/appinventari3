'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ItemLocationFormProps {
  item: {
    id: string;
    name: string;
  };
  onClose: () => void;
  onSave: () => void;
}

interface Location {
  id: string;
  name: string;
}

interface ItemLocation {
  location_id: string;
  quantity: number;
}

interface FormData {
  locations: {
    [key: string]: string; // location_id: quantity
  };
}

export function ItemLocationForm({ item, onClose, onSave }: ItemLocationFormProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentQuantities, setCurrentQuantities] = useState<ItemLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      locations: {},
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar todas las localizaciones
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .order('name');

        if (locationsError) throw locationsError;
        setLocations(locationsData || []);

        // Cargar las cantidades actuales del item
        const { data: quantitiesData, error: quantitiesError } = await supabase
          .from('item_locations')
          .select('location_id, quantity')
          .eq('item_id', item.id);

        if (quantitiesError) throw quantitiesError;
        setCurrentQuantities(quantitiesData || []);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [item.id]);

  const onSubmit = async (data: FormData) => {
    try {
      // Convertir el objeto de locations a un array de registros
      const updates = Object.entries(data.locations).map(([location_id, quantity]) => ({
        item_id: item.id,
        location_id,
        quantity: parseInt(quantity) || 0,
      }));

      // Eliminar registros existentes
      const { error: deleteError } = await supabase
        .from('item_locations')
        .delete()
        .eq('item_id', item.id);

      if (deleteError) throw deleteError;

      // Insertar nuevos registros (solo los que tienen cantidad > 0)
      const validUpdates = updates.filter(update => update.quantity > 0);
      if (validUpdates.length > 0) {
        const { error: insertError } = await supabase
          .from('item_locations')
          .insert(validUpdates);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar las cantidades:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Cantidades por Localización - {item.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {locations.map((location) => {
              const currentQuantity = currentQuantities.find(
                q => q.location_id === location.id
              )?.quantity || 0;

              return (
                <div key={location.id} className="flex items-center space-x-4">
                  <label
                    htmlFor={`locations.${location.id}`}
                    className="block text-sm font-medium text-gray-700 flex-1"
                  >
                    {location.name}
                  </label>
                  <input
                    type="number"
                    id={`locations.${location.id}`}
                    {...register(`locations.${location.id}`)}
                    defaultValue={currentQuantity}
                    min="0"
                    className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 