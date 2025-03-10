-- Añadir columna de imagen_url a la tabla de items
alter table items
add column if not exists image_url text; 