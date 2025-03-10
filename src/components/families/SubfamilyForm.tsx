'use client';

import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SubfamilyFormProps {
  subfamily?: {
    id: string;
    name: string;
    family_id: string;
  } | null;
  familyId: string;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
}

export function SubfamilyForm({ subfamily, familyId, onClose, onSave }: SubfamilyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: subfamily?.name || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (subfamily) {
        // Actualizar subfamilia existente
        const { error } = await supabase
          .from('subfamilies')
          .update({ name: data.name })
          .eq('id', subfamily.id);

        if (error) throw error;
      } else {
        // Crear nueva subfamilia
        const { error } = await supabase
          .from('subfamilies')
          .insert([{ 
            name: data.name,
            family_id: familyId
          }]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar la subfamilia:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {subfamily ? 'Editar' : 'Nova'} Subfamília
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
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'El nom és obligatori' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Desant...'
                : subfamily
                ? 'Actualitzar'
                : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 