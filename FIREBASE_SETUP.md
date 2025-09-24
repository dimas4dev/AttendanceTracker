# 🔥 Configuración de Firebase - AsistenciaFácil

## 📋 Pasos para configurar Firebase

### 1. **Variables de entorno**

Las variables de Firebase ya están configuradas en el archivo `.env`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 2. **Poblar Firebase con datos iniciales**

Ejecuta el siguiente comando para poblar Firebase con todos los salones y estudiantes:

```bash
npm run populate-firebase
```

Este script creará:

- ✅ **9 salones** con los nombres y números correctos
- ✅ **Estudiantes** distribuidos en cada salón
- ✅ **Registros de asistencia** de ejemplo

### 3. **Salones configurados**

El script creará los siguientes salones:

| Salón | Curso                    |
| ------ | ------------------------ |
| 304    | CAPACITACIÓN DESTINO 1A |
| 305    | CAPACITACIÓN DESTINO 1B |
| 306    | CAPACITACIÓN DESTINO 2A |
| 301    | CAPACITACIÓN DESTINO 2B |
| 302    | CAPACITACIÓN DESTINO 3  |
| 307    | ESCUELA MINISTERIAL 1    |
| 303    | ESCUELA MINISTERIAL 2A   |
| 308    | ESCUELA MINISTERIAL 2B   |
| 309    | ESCUELA MINISTERIAL 3    |

### 4. **Verificar configuración**

Después de ejecutar el script, puedes:

1. Visitar `http://localhost:9002/admin` para ver el estado
2. Usar la aplicación principal en `http://localhost:9002`

## 🏗️ Estructura de Firestore

### Colección: `salones`

```json
{
  "salon-304": {
    "name": "SALÓN 304 - CAPACITACIÓN DESTINO 1A",
    "roomNumber": "304",
    "courseType": "CAPACITACIÓN",
    "courseLevel": "DESTINO 1A",
    "createdAt": "2024-..."
  }
}
```

### Colección: `estudiantes`

```json
{
  "studentId": {
    "name": "Juan Pérez",
    "document": "12345",
    "classroomId": "salon-304",
    "createdAt": "2024-..."
  }
}
```

### Colección: `asistencias`

```json
{
  "attendanceId": {
    "classroomId": "salon-304",
    "date": "2024-01-15",
    "present": ["student1", "student2"],
    "absent": ["student3"],
    "createdAt": "2024-...",
    "updatedAt": "2024-..."
  }
}
```

## 🚀 Comandos disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Poblar Firebase con datos iniciales
npm run populate-firebase

# Construir para producción
npm run build
```

## 🔄 Re-ejecutar el script

Si necesitas limpiar y volver a poblar Firebase, simplemente ejecuta:

```bash
npm run populate-firebase
```

El script automáticamente:

- 🧹 Limpia todos los datos existentes
- 🏢 Crea los salones nuevamente
- 👥 Agrega todos los estudiantes
- 📋 Crea registros de asistencia de ejemplo
