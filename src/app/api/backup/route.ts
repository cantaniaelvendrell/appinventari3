import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Desactivar temporalmente las restricciones de clave foránea
    await supabase.rpc('set_session_replication_role', { role: 'replica' });

    // Obtener datos de todas las tablas
    const [users, families, subfamilies, locations, items, itemLocations] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('families').select('*'),
      supabase.from('subfamilies').select('*'),
      supabase.from('locations').select('*'),
      supabase.from('items').select('*'),
      supabase.from('item_locations').select('*'),
    ]);

    // Crear objeto con todos los datos
    const backupData = {
      users: users.data,
      families: families.data,
      subfamilies: subfamilies.data,
      locations: locations.data,
      items: items.data,
      item_locations: itemLocations.data,
      timestamp: new Date().toISOString(),
    };

    // Reactivar las restricciones de clave foránea
    await supabase.rpc('set_session_replication_role', { role: 'origin' });

    // Devolver los datos como un archivo JSON
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.json`,
      },
    });
  } catch (error) {
    console.error('Error al realizar la copia de seguridad:', error);
    return NextResponse.json(
      { error: 'Error al realizar la copia de seguridad' },
      { status: 500 }
    );
  }
} 