



# Configuración del Backend - PGAT-TEC

Este documento detalla los pasos necesarios para configurar el backend del proyecto **PGAT-TEC** utilizando **Node.js** con **TypeScript**.

## 1. Inicializar el proyecto Node.js

Navega a la carpeta donde se encuentra el backend e inicializa un nuevo proyecto Node.js:

```bash
npm init -y
```

## 2. Instalar dependencias

A continuación, instala las dependencias necesarias:

```bash
# Dependencias principales
npm install express pg cors dotenv bcrypt jsonwebtoken helmet

# Dependencias de desarrollo
npm install --save-dev typescript @types/node @types/express @types/pg @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon
```

### Explicación de las dependencias:

- **express**: Framework web para Node.js.
- **pg**: Cliente PostgreSQL para Node.js.
- **cors**: Middleware para habilitar CORS.
- **dotenv**: Para cargar variables de entorno desde un archivo `.env`.
- **bcrypt**: Para hashear (encriptar) contraseñas de manera segura.
- **jsonwebtoken**: Para implementar autenticación basada en JSON Web Tokens (JWT).
- **helmet**: Middleware para agregar cabeceras de seguridad en Express.

### Dependencias de desarrollo:

- **typescript** y **@types/**: Añaden compatibilidad con TypeScript.
- **ts-node**: Permite ejecutar TypeScript directamente sin compilar manualmente.
- **nodemon**: Reinicia automáticamente la aplicación cuando hay cambios en el código.

## 3. Configurar TypeScript

Crea un archivo `tsconfig.json` en la raíz del proyecto con el siguiente contenido:

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=pgat-postgres
DB_PORT=5432
DB_NAME=pgat_tec_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret
JWT_SECRET=cambiar_esto_por_un_secreto_mas_seguro
JWT_EXPIRES_IN=7d
```

## 5. Estructura del proyecto

La siguiente estructura de carpetas y archivos se crea utilizando un script de PowerShell:

```bash
PGAT_BackEnd/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── types/
├── test/
├── scripts/
├── docs/
├── .env
├── .gitignore
└── README.md
```

## 6. Ejecutar el proyecto

Para ejecutar el proyecto en modo desarrollo, usa el siguiente comando:

```bash
npx nodemon src/server.ts
```

En caso de que quieras compilar el código TypeScript a JavaScript:

```bash
npx tsc
```

Y luego ejecuta el código compilado:

```bash
node dist/server.js
```

