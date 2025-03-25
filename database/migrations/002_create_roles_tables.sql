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