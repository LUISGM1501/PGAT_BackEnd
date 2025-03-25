-- Tabla para ofertas (asistencias/tutorías/proyectos)
CREATE TABLE ofertas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Asistencia', 'Tutoría', 'Proyecto')),
    descripcion TEXT NOT NULL,
    vacantes INTEGER NOT NULL,
    horas_semana INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'finalizada', 'cancelada')),
    escuela_id INTEGER NULL REFERENCES escuelas(id) ON DELETE SET NULL,
    profesor_id INTEGER NULL REFERENCES profesores(id) ON DELETE SET NULL,
    promedio_minimo DECIMAL(5,2) NOT NULL DEFAULT 70.0,
    cursos_requeridos TEXT NULL,
    beneficio VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para proyectos de investigación (ampliación del tipo Proyecto en ofertas)
CREATE TABLE proyectos_investigacion (
    id SERIAL PRIMARY KEY,
    oferta_id INTEGER UNIQUE NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    area_investigacion VARCHAR(100) NOT NULL,
    objetivos TEXT NOT NULL,
    resultados_esperados TEXT NOT NULL
);

CREATE INDEX idx_ofertas_estado ON ofertas(estado);
CREATE INDEX idx_ofertas_tipo ON ofertas(tipo);