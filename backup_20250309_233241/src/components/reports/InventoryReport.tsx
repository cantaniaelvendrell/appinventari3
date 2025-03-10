'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface ReportFilters {
  family_id?: string;
  subfamily_id?: string;
  location_id?: string;
  usage?: 'internal' | 'external';
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

interface Location {
  id: string;
  name: string;
}

interface ItemLocation {
  location: {
    id: string;
    name: string;
  };
  quantity: number;
}

interface InventoryItem {
  id: string;
  name: string;
  model: string;
  family: { name: string };
  subfamily: { name: string };
  usage: 'internal' | 'external';
  observations: string | null;
  item_locations: ItemLocation[];
}

export function InventoryReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [families, setFamilies] = useState<Family[]>([]);
  const [subfamilies, setSubfamilies] = useState<Subfamily[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    if (filters.family_id) {
      fetchSubfamilies(filters.family_id);
    } else {
      setSubfamilies([]);
      setFilters(prev => ({ ...prev, subfamily_id: undefined }));
    }
  }, [filters.family_id]);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchFiltersData = async () => {
    try {
      const [familiesRes, locationsRes] = await Promise.all([
        supabase.from('families').select('*').order('name'),
        supabase.from('locations').select('*').order('name')
      ]);

      if (familiesRes.error) throw familiesRes.error;
      if (locationsRes.error) throw locationsRes.error;

      setFamilies(familiesRes.data || []);
      setLocations(locationsRes.data || []);
    } catch (error) {
      console.error('Error al cargar datos de filtros:', error);
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
      console.error('Error al cargar subfamilias:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      let query = supabase
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
            locations(id, name)
          )
        `)
        .order('name');

      if (filters.family_id) {
        query = query.eq('family_id', filters.family_id);
      }
      if (filters.subfamily_id) {
        query = query.eq('subfamily_id', filters.subfamily_id);
      }
      if (filters.usage) {
        query = query.eq('usage', filters.usage);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al cargar items:', error);
        throw error;
      }

      let filteredData = data || [];
      
      // Transformar los datos para mantener la estructura esperada
      filteredData = filteredData.map(item => ({
        ...item,
        family: item.families,
        subfamily: item.subfamilies,
        item_locations: item.item_locations?.map(il => ({
          ...il,
          location: il.locations
        }))
      }));

      if (filters.location_id) {
        filteredData = filteredData.filter(item =>
          item.item_locations.some(il => il.location.id === filters.location_id)
        );
      }

      setItems(filteredData);
    } catch (error) {
      console.error('Error al cargar items:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Nombre',
      'Modelo',
      'Familia',
      'Subfamilia',
      'Uso',
      'Observaciones',
      'Cantidades por Localización'
    ];

    const rows = items.map(item => [
      item.name,
      item.model,
      item.family.name,
      item.subfamily.name,
      item.usage === 'internal' ? 'Interno' : 'Externo',
      item.observations || '',
      item.item_locations.map((il: ItemLocation) => `${il.location.name}: ${il.quantity}`).join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_inventario.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = [
      'Nombre',
      'Modelo',
      'Familia',
      'Subfamilia',
      'Uso',
      'Observaciones',
      'Cantidades por Localización'
    ];

    const rows = items.map(item => [
      item.name,
      item.model,
      item.family.name,
      item.subfamily.name,
      item.usage === 'internal' ? 'Interno' : 'Externo',
      item.observations || '',
      item.item_locations.map((il: ItemLocation) => `${il.location.name}: ${il.quantity}`).join('; ')
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // Ajustar el ancho de las columnas
    const columnWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
    worksheet['!cols'] = columnWidths;

    // Aplicar estilos
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "EFEFEF" } },
      alignment: { horizontal: "center" }
    };

    // Aplicar estilos a los encabezados
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      worksheet[cellRef].s = headerStyle;
    }

    XLSX.writeFile(workbook, 'reporte_inventario.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reporte de Inventario</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Exportar a CSV
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="family" className="block text-sm font-medium text-gray-700">
            Familia
          </label>
          <select
            id="family"
            value={filters.family_id || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, family_id: e.target.value || undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Todas las familias</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subfamily" className="block text-sm font-medium text-gray-700">
            Subfamilia
          </label>
          <select
            id="subfamily"
            value={filters.subfamily_id || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, subfamily_id: e.target.value || undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={!filters.family_id}
          >
            <option value="">Todas las subfamilias</option>
            {subfamilies.map((subfamily) => (
              <option key={subfamily.id} value={subfamily.id}>
                {subfamily.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Localización
          </label>
          <select
            id="location"
            value={filters.location_id || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, location_id: e.target.value || undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Todas las localizaciones</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700">
            Uso
          </label>
          <select
            id="usage"
            value={filters.usage || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, usage: e.target.value as 'internal' | 'external' | undefined }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Todos los usos</option>
            <option value="internal">Interno</option>
            <option value="external">Externo</option>
          </select>
        </div>
      </div>

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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron items con los filtros seleccionados
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.family.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.subfamily.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.usage === 'internal' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.usage === 'internal' ? 'Interno' : 'Externo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.item_locations.map((il: ItemLocation) => (
                      <div key={il.location.name}>
                        {il.location.name}: {il.quantity}
                      </div>
                    ))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 