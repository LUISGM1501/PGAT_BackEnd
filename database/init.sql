-- Ejecutar migraciones
\i /docker-entrypoint-initdb.d/migrations/001_create_users_table.sql
\i /docker-entrypoint-initdb.d/migrations/002_create_roles_tables.sql
\i /docker-entrypoint-initdb.d/migrations/003_create_opportunities_tables.sql
\i /docker-entrypoint-initdb.d/migrations/004_create_applications_tables.sql
\i /docker-entrypoint-initdb.d/migrations/005_create_tracking_tables.sql
\i /docker-entrypoint-initdb.d/migrations/006_create_economic_benefits_tables.sql
\i /docker-entrypoint-initdb.d/migrations/007_create_additional_tables.sql

-- Ejecutar seeders
\i /docker-entrypoint-initdb.d/seeders/001_seed_users.sql
\i /docker-entrypoint-initdb.d/seeders/002_seed_opportunities.sql
