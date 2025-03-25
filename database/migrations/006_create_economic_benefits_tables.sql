-- Tabla para beneficios económicos
CREATE TABLE beneficios_economicos (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('exoneracion', 'pago', 'mixto')),
    porcentaje_exoneracion INTEGER NULL CHECK (porcentaje_exoneracion IS NULL OR (porcentaje_exoneracion >= 0 AND porcentaje_exoneracion <= 100)),
    monto_por_hora DECIMAL(10,2) NULL,
    total_horas INTEGER NULL,
    monto_total DECIMAL(10,2) NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'procesado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_beneficios_postulacion ON beneficios_economicos(postulacion_id);