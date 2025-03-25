-- Definición del esquema completo

-- Tabla de Usuarios (base para todos los tipos de usuarios)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('estudiante', 'profesor', 'escuela', 'admin')),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    ultimo_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estudiantes
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carnet VARCHAR(20) UNIQUE NOT NULL,
    carrera VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    promedio DECIMAL(5,2) NOT NULL,
    cursosAprobados TEXT[] NULL,
    habilidades TEXT[] NULL
);

-- Tabla de Profesores
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    departamento VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL
);

-- Tabla de Escuelas/Departamentos
CREATE TABLE escuelas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    facultad VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    responsable VARCHAR(100) NOT NULL,
    descripcion TEXT NULL
);

-- Tabla para las asignaturas que imparten los profesores
CREATE TABLE asignaturas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    descripcion TEXT NULL
);

-- Tabla de relación entre profesores y asignaturas
CREATE TABLE profesor_asignatura (
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    asignatura_id INTEGER NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    PRIMARY KEY (profesor_id, asignatura_id)
);

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

-- Tabla para proyectos de investigación (ampliación del tipo Proyecto en ofertas)
CREATE TABLE proyectos_investigacion (
    id SERIAL PRIMARY KEY,
    oferta_id INTEGER UNIQUE NOT NULL REFERENCES ofertas(id) ON DELETE CASCADE,
    area_investigacion VARCHAR(100) NOT NULL,
    objetivos TEXT NOT NULL,
    resultados_esperados TEXT NOT NULL
);

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

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_ofertas_estado ON ofertas(estado);
CREATE INDEX idx_ofertas_tipo ON ofertas(tipo);
CREATE INDEX idx_postulaciones_estudiante ON postulaciones(estudiante_id);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(oferta_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_registro_horas_postulacion ON registro_horas(postulacion_id);
CREATE INDEX idx_evaluaciones_postulacion ON evaluaciones(postulacion_id);
CREATE INDEX idx_beneficios_postulacion ON beneficios_economicos(postulacion_id);