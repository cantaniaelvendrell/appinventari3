'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ItemLocationForm } from './ItemLocationForm';

interface ItemFormProps {
  item?: {
    id: string;
    name: string;
    model: string;
    family_id: string;
    subfamily_id: string;
    usage: 'internal' | 'external';
    image_url: string | null;
    observations: string | null;
  } | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  model: string;
  family_id: string;
  subfamily_id: string;
  usage: 'internal' | 'external';
  observations: string;
}

interface Family {
  id: string;
  name: string;
}

interface Subfamily {
  id: string;
  name: string;
  family_id: string;
}

export function ItemForm({ item, onClose, onSave }: ItemFormProps) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(item?.family_id || '');
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newItemId, setNewItemId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: item?.name || '',
      model: item?.model || '',
      family_id: item?.family_id || '',
      subfamily_id: item?.subfamily_id || '',
      usage: item?.usage || 'internal',
      observations: item?.observations || '',
    },
  });

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      fetchSubfamilies(selectedFamilyId);
    } else {
      setSubfamilies([]);
      setValue('subfamily_id', '');
    }
  }, [selectedFamilyId, setValue]);

  const fetchFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('name');

      if (error) throw error;
      setFamilies(data || []);
    } catch (error) {
      console.error('Error al cargar las familias:', error);
    }
  };

  const fetchSubfamilies = async (familyId: string) => {
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
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Datos del formulario:', data);
      
      if (item) {
        console.log('Actualizando item existente:', item.id);
        const { error } = await supabase
          .from('items')
          .update({
            name: data.name,
            model: data.model,
            family_id: data.family_id,
            subfamily_id: data.subfamily_id,
            usage: data.usage,
            observations: data.observations || null,
          })
          .eq('id', item.id);

        if (error) {
          console.error('Error al actualizar item:', error);
          throw error;
        }
        onSave();
        onClose();
      } else {
        console.log('Creando nuevo item con datos:', {
          name: data.name,
          model: data.model,
          family_id: data.family_id,
          subfamily_id: data.subfamily_id,
          usage: data.usage,
          observations: data.observations || null,
        });
        
        const { data: newItem, error } = await supabase
          .from('items')
          .insert([{
            name: data.name,
            model: data.model,
            family_id: data.family_id,
            subfamily_id: data.subfamily_id,
            usage: data.usage,
            observations: data.observations || null,
          }])
          .select()
          .single();

        if (error) {
          console.error('Error detallado al crear item:', error);
          throw error;
        }
        
        console.log('Item creado exitosamente:', newItem);
        setNewItemId(newItem.id);
        setShowLocationForm(true);
      }
    } catch (error) {
      console.error('Error completo al guardar el item:', error);
      // Si el error tiene un mensaje específico, mostrarlo
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
      }
      // Si el error tiene propiedades adicionales, mostrarlas
      console.error('Propiedades del error:', JSON.stringify(error, null, 2));
    }
  };

  const familyId = watch('family_id');
  if (familyId !== selectedFamilyId) {
    setSelectedFamilyId(familyId);
  }

  return (
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {item ? 'Editar' : 'Nuevo'} Item
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'El nombre es requerido' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Modelo
                </label>
                <input
                  type="text"
                  id="model"
                  {...register('model', { required: 'El modelo es requerido' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="family_id" className="block text-sm font-medium text-gray-700">
                  Familia
                </label>
                <select
                  id="family_id"
                  {...register('family_id', { required: 'La familia es requerida' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccionar familia</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </select>
                {errors.family_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.family_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="subfamily_id" className="block text-sm font-medium text-gray-700">
                  Subfamilia
                </label>
                <select
                  id="subfamily_id"
                  {...register('subfamily_id', { required: 'La subfamilia es requerida' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  disabled={!selectedFamilyId}
                >
                  <option value="">Seleccionar subfamilia</option>
                  {subfamilies.map((subfamily) => (
                    <option key={subfamily.id} value={subfamily.id}>
                      {subfamily.name}
                    </option>
                  ))}
                </select>
                {errors.subfamily_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.subfamily_id.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="usage" className="block text-sm font-medium text-gray-700">
                  Uso
                </label>
                <select
                  id="usage"
                  {...register('usage')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="internal">Interno</option>
                  <option value="external">Externo</option>
                </select>
              </div>

              <div>
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  id="observations"
                  rows={3}
                  {...register('observations')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
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
                {isSubmitting
                  ? 'Guardando...'
                  : item
                  ? 'Actualizar'
                  : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showLocationForm && newItemId && (
        <ItemLocationForm
          item={{ id: newItemId, name: watch('name') }}
          onClose={() => {
            onSave();
            onClose();
          }}
          onSave={() => {
            onSave();
            onClose();
          }}
        />
      )}
    </>
  );
} 