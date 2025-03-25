-- Tabla para criterios de elegibilidad por escuela
CREATE TABLE criterios_escuela (
    id SERIAL PRIMARY KEY,
    escuela_id INTEGER NOT NULL REFERENCES escuelas(id) ON DELETE CASCADE,
    promedio_minimo DECIMAL(5,2) NOT NULL DEFAULT 70.0,
    cursos_requeridos TEXT NULL,
    horas_maximas_semestre INTEGER NOT NULL DEFAULT 20,
    requiere_entrevista BOOLEAN NOT NULL DEFAULT false
);

-- Tabla para notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT false,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);