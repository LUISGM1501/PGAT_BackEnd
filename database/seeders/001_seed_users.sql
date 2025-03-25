-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, correo, password, tipo) VALUES
('Administrador', 'admin@itcr.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'admin'),
('Dr. Roberto Cortés', 'rcortes@itcr.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'profesor'),
('Escuela de Computación', 'computacion@itcr.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'escuela'),
('Luis Urbina', 'lurbina@estudiante.tec.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'estudiante'),
('María González', 'mgonzalez@estudiante.tec.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'estudiante'),
('Dr. Ana Pérez', 'aperez@itcr.ac.cr', '$2a$10$XFWu1TesM5ZCMWo7mPJQwuJK3zKmgFkE9OvUbagRZ2qdGZxghJQBW', 'profesor');

-- Insertar estudiantes
INSERT INTO estudiantes (usuario_id, carnet, carrera, nivel, promedio) VALUES
(4, '2023156802', 'Ingeniería en Computación', 'Segundo año', 87.5),
(5, '2023156803', 'Ingeniería en Computación', 'Primer año', 90.0);

-- Insertar profesores
INSERT INTO profesores (usuario_id, departamento, especialidad) VALUES
(2, 'Escuela de Ingeniería en Computación', 'Bases de Datos'),
(6, 'Escuela de Ingeniería en Computación', 'Inteligencia Artificial');

-- Insertar escuelas
INSERT INTO escuelas (usuario_id, facultad, responsable, descripcion) VALUES
(3, 'Ingeniería', 'Dr. Roberto Cortés', 'Escuela de Ingeniería en Computación del TEC');