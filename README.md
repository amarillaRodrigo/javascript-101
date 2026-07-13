# Todo API

API RESTful para gestionar tareas, construida con Node.js, Express y MongoDB.

## Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express
- **Base de datos**: MongoDB (Mongoose ODM)
- **Validaciones**: Zod
- **Despliegue**: Railway

## Instalación y Ejecución en Local

### Prerrequisitos

- Node.js (v18 o superior)
- npm
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (para base de datos en la nube)

### Pasos

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd javascript-101
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus credenciales de MongoDB Atlas:
```
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/todosDB?retryWrites=true&w=majority
NODE_ENV=development
```

5. Iniciar el servidor:
```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints Disponibles

### Base URL

- **Local**: `http://localhost:3000`
- **Producción**: `[URL_PÚBLICA_DE_RAILWAY]`

### Obtener todas las tareas

```
GET /api/todos
```

**Respuesta (200)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Comprar víveres",
      "description": "Leche, huevos, pan",
      "completed": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Crear una tarea

```
POST /api/todos
```

**Body (JSON)**:
```json
{
  "title": "Comprar víveres",
  "description": "Leche, huevos, pan (opcional)",
  "completed": false (opcional, default: false)
}
```

**Campos requeridos**:
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| title | string | Sí | Título de la tarea (max 100 caracteres) |
| description | string | No | Descripción (max 500 caracteres) |
| completed | boolean | No | Estado de la tarea (default: false) |

**Respuesta (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Comprar víveres",
    "description": "Leche, huevos, pan",
    "completed": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errores de validación (400)**:
```json
{
  "success": false,
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Actualizar una tarea

```
PUT /api/todos/:id
```

**Parámetro**: `id` - ID de la tarea (MongoDB ObjectId)

**Body (JSON)** - Todos los campos son opcionales:
```json
{
  "title": "Comprar víveres actualizado",
  "description": "Nueva descripción",
  "completed": true
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Comprar víveres actualizado",
    "description": "Nueva descripción",
    "completed": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Errores**:
- `400`: ID inválido
- `404`: Tarea no encontrada

### Eliminar una tarea

```
DELETE /api/todos/:id
```

**Parámetro**: `id` - ID de la tarea (MongoDB ObjectId)

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {}
}
```

**Errores**:
- `400`: ID inválido
- `404`: Tarea no encontrada

## URL Pública (Producción)

**Railway**: [TU_URL_DE_RAILWAY_AQUÍ]

> Nota: Recuerda configurar las variables de entorno en Railway con tu `MONGO_URI` de MongoDB Atlas.

## Estructura del Proyecto

```
javascript-101/
├── src/
│   ├── config/
│   │   └── database.js        # Conexión a MongoDB
│   ├── controllers/
│   │   └── todoController.js  # Lógica de negocio CRUD
│   ├── middleware/
│   │   ├── errorHandler.js    # Manejo centralizado de errores
│   │   └── validate.js        # Middleware de validación Zod
│   ├── models/
│   │   └── Todo.js            # Modelo Mongoose
│   ├── routes/
│   │   └── todoRoutes.js      # Definición de rutas
│   ├── schemas/
│   │   └── todoSchema.js      # Schemas de validación Zod
│   └── app.js                 # Configuración de Express
├── .env.example               # Plantilla de variables de entorno
├── .env                       # Variables de entorno (no commitear)
├── .gitignore
├── package.json
├── README.md
└── server.js                  # Punto de entrada
```A
|----------|-------------|---------|
| PORT | Puerto del servidor | `3000` |
| MONGO_URI | URI de conexión a MongoDB | `mongodb+srv://...` |
| NODE_ENV | Modo de ejecución | `development` o `production` |

## Despliegue en Railway

1. Crear cuenta en [Railway](https://railway.app)
2. Conectar el repositorio de GitHub
3. Configurar las variables de entorno en el dashboard de Railway
4. Railway desplegará automáticamente

## Licencia

ISC
