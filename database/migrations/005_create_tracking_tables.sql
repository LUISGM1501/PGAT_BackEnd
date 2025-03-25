-- Tabla para registro de horas trabajadas
CREATE TABLE registro_horas (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    horas DECIMAL(5,2) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para evaluaciones de desempeño
CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentario TEXT NOT NULL,
    calificacion DECIMAL(5,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 100)
);

CREATE INDEX idx_registro_horas_postulacion ON registro_horas(postulacion_id);
CREATE INDEX idx_evaluaciones_postulacion ON evaluaciones(postulacion_id);