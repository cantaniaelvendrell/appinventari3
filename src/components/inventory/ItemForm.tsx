'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ItemLocationForm } from './ItemLocationForm';
import { Dialog } from '@headlessui/react';

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
    en_prestec: string | null;
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
  en_prestec: string;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newItemId, setNewItemId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(item?.image_url || '');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(item?.family_id || '');
  const [selectedSubfamilyId, setSelectedSubfamilyId] = useState<string>(item?.subfamily_id || '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: item?.name || '',
      model: item?.model || '',
      family_id: item?.family_id || '',
      subfamily_id: item?.subfamily_id || '',
      usage: item?.usage || 'internal',
      observations: item?.observations || '',
      en_prestec: item?.en_prestec || '',
    },
  });

  const watchedFamilyId = watch('family_id');

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchFamilies();
      if (item?.family_id) {
        await fetchSubfamilies(item.family_id);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadSubfamilies = async () => {
      if (selectedFamilyId) {
        await fetchSubfamilies(selectedFamilyId);
        if (!item || selectedFamilyId !== item.family_id) {
          setSelectedSubfamilyId('');
          setValue('subfamily_id', '');
        }
      }
    };
    loadSubfamilies();
  }, [selectedFamilyId]);

  const fetchFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('name');

      if (error) throw error;
      setFamilies(data || []);
    } catch (error) {
      console.error('Error al cargar les famílies:', error);
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
      console.error('Error al cargar les subfamílies:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `items/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('items')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('items')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      let finalImageUrl = previewUrl;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const itemData = {
        name: data.name,
        model: data.model,
        family_id: data.family_id,
        subfamily_id: data.subfamily_id,
        usage: data.usage,
        observations: data.observations || null,
        image_url: finalImageUrl,
        en_prestec: data.en_prestec || null,
        created_at: new Date().toISOString(),
      };

      if (item) {
        console.log('Actualitzant item existent:', item.id);
        const { error } = await supabase
          .from('items')
          .update(itemData)
          .eq('id', item.id);

        if (error) {
          console.error('Error al actualizar item:', error);
          throw error;
        }
        onSave();
        onClose();
      } else {
        console.log('Creant nou item amb dades:', {
          name: data.name,
          model: data.model,
          family_id: data.family_id,
          subfamily_id: data.subfamily_id,
          usage: data.usage,
          observations: data.observations || null,
        });
        
        const { data: newItem, error } = await supabase
          .from('items')
          .insert([itemData])
          .select()
          .single();

        if (error) {
          console.error('Error detallat al crear item:', error);
          throw error;
        }
        
        console.log('Item creat exitosament:', newItem);
        setNewItemId(newItem.id);
        setShowLocationForm(true);
      }
    } catch (error) {
      console.error('Error complet al guardar l\'item:', error);
      // Si l'error té un missatge específic, mostrar-lo
      if (error instanceof Error) {
        console.error('Missatge d\'error:', error.message);
      }
      // Si l'error té propietats addicionals, mostrar-les
      console.error('Propietats de l\'error:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold mb-6">
            {item ? 'Editar Element' : 'Nou Element'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                {...register('model')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Família</label>
              <select
                {...register('family_id')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                value={selectedFamilyId}
                onChange={(e) => {
                  const newFamilyId = e.target.value;
                  setSelectedFamilyId(newFamilyId);
                  setValue('family_id', newFamilyId);
                  if (!item || newFamilyId !== item.family_id) {
                    setValue('subfamily_id', '');
                  }
                }}
              >
                <option value="">Selecciona una família</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subfamília</label>
              <select
                {...register('subfamily_id')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                value={selectedSubfamilyId}
                onChange={(e) => {
                  const newSubfamilyId = e.target.value;
                  setSelectedSubfamilyId(newSubfamilyId);
                  setValue('subfamily_id', newSubfamilyId);
                }}
              >
                <option value="">Selecciona una subfamília</option>
                {subfamilies.map((subfamily) => (
                  <option key={subfamily.id} value={subfamily.id}>
                    {subfamily.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ús</label>
              <select
                {...register('usage')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="internal">Intern</option>
                <option value="external">Extern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observacions</label>
              <textarea
                {...register('observations')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">En préstec</label>
              <textarea
                {...register('en_prestec')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Detalls del préstec..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Imatge</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Previsualització" className="mx-auto h-32 w-32 object-cover" />
                  ) : (
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Pujar imatge</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG fins a 10MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Desant...' : 'Desar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showLocationForm && newItemId && (
        <ItemLocationForm
          item={{ id: newItemId, name: getValues('name') }}
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
    </Dialog>
  );
} 