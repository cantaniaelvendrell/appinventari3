-- Copia de seguridad de la base de datos
-- Fecha: $(date)

-- Desactivar temporalmente las restricciones de clave foránea
SET session_replication_role = 'replica';

-- Limpiar tablas existentes en orden inverso a las dependencias
TRUNCATE TABLE item_locations CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE subfamilies CASCADE;
TRUNCATE TABLE families CASCADE;
TRUNCATE TABLE users CASCADE;

-- Tabla: users
CREATE TEMP TABLE temp_users AS
SELECT id, email, role, created_at, updated_at
FROM users;

INSERT INTO users (id, email, role, created_at, updated_at)
SELECT id, email, role, created_at, updated_at
FROM temp_users;

DROP TABLE temp_users;

-- Tabla: families
CREATE TEMP TABLE temp_families AS
SELECT id, name, created_at
FROM families;

INSERT INTO families (id, name, created_at)
SELECT id, name, created_at
FROM temp_families;

DROP TABLE temp_families;

-- Tabla: subfamilies
CREATE TEMP TABLE temp_subfamilies AS
SELECT id, name, family_id, created_at
FROM subfamilies;

INSERT INTO subfamilies (id, name, family_id, created_at)
SELECT id, name, family_id, created_at
FROM temp_subfamilies;

DROP TABLE temp_subfamilies;

-- Tabla: locations
CREATE TEMP TABLE temp_locations AS
SELECT id, name, created_at
FROM locations;

INSERT INTO locations (id, name, created_at)
SELECT id, name, created_at
FROM temp_locations;

DROP TABLE temp_locations;

-- Tabla: items
CREATE TEMP TABLE temp_items AS
SELECT id, name, model, family_id, subfamily_id, usage, image_url, observations, created_at
FROM items;

INSERT INTO items (id, name, model, family_id, subfamily_id, usage, image_url, observations, created_at)
SELECT id, name, model, family_id, subfamily_id, usage, image_url, observations, created_at
FROM temp_items;

DROP TABLE temp_items;

-- Tabla: item_locations
CREATE TEMP TABLE temp_item_locations AS
SELECT id, item_id, location_id, quantity, created_at
FROM item_locations;

INSERT INTO item_locations (id, item_id, location_id, quantity, created_at)
SELECT id, item_id, location_id, quantity, created_at
FROM temp_item_locations;

DROP TABLE temp_item_locations;

-- Reactivar las restricciones de clave foránea
SET session_replication_role = 'origin'; 