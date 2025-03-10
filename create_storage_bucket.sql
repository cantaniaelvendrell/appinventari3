-- Crear el bucket para las imágenes de los items
insert into storage.buckets (id, name, public)
values ('items', 'items', true);

-- Crear políticas de almacenamiento para el bucket de items
create policy "Imágenes accesibles públicamente"
on storage.objects for select
to public
using ( bucket_id = 'items' );

create policy "Los usuarios autenticados pueden subir imágenes"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'items' );

create policy "Los usuarios autenticados pueden actualizar sus imágenes"
on storage.objects for update
to authenticated
using ( bucket_id = 'items' );

create policy "Los usuarios autenticados pueden eliminar sus imágenes"
on storage.objects for delete
to authenticated
using ( bucket_id = 'items' ); 