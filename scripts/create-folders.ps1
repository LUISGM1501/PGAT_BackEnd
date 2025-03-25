# Script de PowerShell para crear estructura de carpetas para PGAT_BackEnd

# Ya que la carpeta raíz ya existe, la usamos como base
$basePath = "PGAT_BackEnd"

# Crear estructura principal
$folders = @(
    "src\config",
    "src\controllers",
    "src\middleware",
    "src\models",
    "src\routes",
    "src\services",
    "src\utils",
    "src\types",
    "test",
    "scripts",
    "docs"
)

foreach ($folder in $folders) {
    $path = Join-Path -Path $basePath -ChildPath $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear subdirectorios en controllers
$controllerFolders = @(
    "src\controllers\auth",
    "src\controllers\estudiante",
    "src\controllers\profesor",
    "src\controllers\escuela",
    "src\controllers\admin"
)

foreach ($folder in $controllerFolders) {
    $path = Join-Path -Path $basePath -ChildPath $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear subdirectorios específicos para cada módulo
$specificFolders = @(
    "src\controllers\estudiante\perfil",
    "src\controllers\estudiante\busqueda",
    "src\controllers\estudiante\postulacion",
    "src\controllers\estudiante\actividad",
    "src\controllers\profesor\perfil",
    "src\controllers\profesor\oferta",
    "src\controllers\profesor\postulacion",
    "src\controllers\profesor\seguimiento",
    "src\controllers\escuela\perfil",
    "src\controllers\escuela\oferta",
    "src\controllers\escuela\postulacion",
    "src\controllers\escuela\beneficio",
    "src\controllers\admin\usuario",
    "src\controllers\admin\contenido",
    "src\controllers\admin\reporte"
)

foreach ($folder in $specificFolders) {
    $path = Join-Path -Path $basePath -ChildPath $folder
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos base
$baseFiles = @(
    "src\app.ts",
    "src\server.ts",
    "src\config\index.ts",
    "src\controllers\index.ts",
    "src\middleware\index.ts",
    "src\models\index.ts",
    "src\routes\index.ts",
    "src\services\index.ts",
    "src\utils\index.ts",
    "src\types\index.ts"
)

foreach ($file in $baseFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de configuración
$configFiles = @(
    "src\config\database.ts",
    "src\config\auth.ts",
    "src\config\cors.ts"
)

foreach ($file in $configFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de middleware
$middlewareFiles = @(
    "src\middleware\auth.middleware.ts",
    "src\middleware\validator.middleware.ts",
    "src\middleware\error.middleware.ts"
)

foreach ($file in $middlewareFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de modelos
$modelFiles = @(
    "src\models\Usuario.model.ts",
    "src\models\Estudiante.model.ts",
    "src\models\Profesor.model.ts",
    "src\models\Escuela.model.ts",
    "src\models\Oferta.model.ts",
    "src\models\Postulacion.model.ts",
    "src\models\Evaluacion.model.ts",
    "src\models\RegistroHoras.model.ts", 
    "src\models\BeneficioEconomico.model.ts",
    "src\models\associations.ts"
)

foreach ($file in $modelFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de rutas
$routeFiles = @(
    "src\routes\auth.routes.ts",
    "src\routes\estudiante.routes.ts",
    "src\routes\profesor.routes.ts",
    "src\routes\escuela.routes.ts",
    "src\routes\admin.routes.ts"
)

foreach ($file in $routeFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de servicios
$serviceFiles = @(
    "src\services\auth.service.ts",
    "src\services\estudiante.service.ts",
    "src\services\profesor.service.ts",
    "src\services\escuela.service.ts",
    "src\services\oferta.service.ts",
    "src\services\postulacion.service.ts",
    "src\services\evaluacion.service.ts",
    "src\services\reporte.service.ts"
)

foreach ($file in $serviceFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de utilidades
$utilFiles = @(
    "src\utils\logger.ts",
    "src\utils\validators.ts",
    "src\utils\helpers.ts"
)

foreach ($file in $utilFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de tipos
$typeFiles = @(
    "src\types\auth.types.ts",
    "src\types\estudiante.types.ts",
    "src\types\profesor.types.ts",
    "src\types\escuela.types.ts",
    "src\types\oferta.types.ts", 
    "src\types\request.types.ts"
)

foreach ($file in $typeFiles) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

# Crear archivos de configuración básicos
$configRoot = @(
    "README.md",
    ".gitignore",
    ".env.example"
)

foreach ($file in $configRoot) {
    $path = Join-Path -Path $basePath -ChildPath $file
    if (-not (Test-Path $path)) {
        New-Item -ItemType File -Path $path -Force
        Write-Host "Creado: $path"
    }
}

Write-Host "Estructura de carpetas creada exitosamente para PGAT_BackEnd"