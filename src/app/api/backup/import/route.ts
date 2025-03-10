import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const backupData = JSON.parse(text);

    // Desactivar temporalmente las restricciones de clave foránea
    await supabase.rpc('set_session_replication_role', { role: 'replica' });

    // Truncar las tablas existentes
    await Promise.all([
      supabase.from('item_locations').delete().neq('id', ''),
      supabase.from('items').delete().neq('id', ''),
      supabase.from('locations').delete().neq('id', ''),
      supabase.from('subfamilies').delete().neq('id', ''),
      supabase.from('families').delete().neq('id', ''),
      supabase.from('users').delete().neq('id', ''),
    ]);

    // Insertar los datos del backup
    await Promise.all([
      supabase.from('users').insert(backupData.users),
      supabase.from('families').insert(backupData.families),
      supabase.from('subfamilies').insert(backupData.subfamilies),
      supabase.from('locations').insert(backupData.locations),
      supabase.from('items').insert(backupData.items),
      supabase.from('item_locations').insert(backupData.item_locations),
    ]);

    // Reactivar las restricciones de clave foránea
    await supabase.rpc('set_session_replication_role', { role: 'origin' });

    return NextResponse.json({ message: 'Copia de seguridad importada correctamente' });
  } catch (error) {
    console.error('Error al importar la copia de seguridad:', error);
    return NextResponse.json(
      { error: 'Error al importar la copia de seguridad' },
      { status: 500 }
    );
  }
} 