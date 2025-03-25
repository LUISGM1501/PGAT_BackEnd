-- Tabla para postulaciones
CREATE TABLE postulaciones (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    oferta_id INTEGER NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'cancelada')),
    comentario TEXT NULL,
    motivacion TEXT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(estudiante_id, oferta_id)
);

CREATE INDEX idx_postulaciones_estudiante ON postulaciones(estudiante_id);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(oferta_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);