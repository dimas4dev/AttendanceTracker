# 🔍 Índices de Firebase Requeridos

Firebase requiere índices compuestos para consultas que combinan `where` y `orderBy` en diferentes campos.

## 📋 Índices Necesarios

### 1. Índice para Estudiantes
**Colección:** `estudiantes`  
**Campos:**
- `classroomId` (Ascending)
- `name` (Ascending)

**Consulta que lo requiere:**
```javascript
query(
  collection(db, 'estudiantes'),
  where('classroomId', '==', classroomId),
  orderBy('name')
)
```

### 2. Índice para Asistencias
**Colección:** `asistencias`  
**Campos:**
- `classroomId` (Ascending)
- `date` (Descending)

**Consulta que lo requiere:**
```javascript
query(
  collection(db, 'asistencias'),
  where('classroomId', '==', classroomId),
  orderBy('date', 'desc')
)
```

### 3. Índice para Novedades
**Colección:** `novedades`  
**Campos:**
- `classroomId` (Ascending)
- `createdAt` (Descending)

**Consulta que lo requiere:**
```javascript
query(
  collection(db, 'novedades'),
  where('classroomId', '==', classroomId),
  orderBy('createdAt', 'desc')
)
```

## 🚀 Cómo Crear los Índices

### Opción 1: Enlace Directo (Recomendado)
Firebase te proporcionará enlaces directos cuando encuentres el error. Haz clic en el enlace y crea el índice automáticamente.

### Opción 2: Crear Manualmente
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `studio-8106566699-d71ec`
3. Ve a **Firestore Database** → **Indexes**
4. Haz clic en **Create Index**
5. Configura los campos según la tabla de arriba

### Opción 3: Usar Firebase CLI
```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Inicializar proyecto
firebase init firestore

# Crear archivo firestore.indexes.json
```

## ⚡ Solución Temporal

Mientras creas los índices, el código ya está configurado para:
- Obtener los datos sin `orderBy`
- Ordenar los resultados en el código JavaScript
- Funcionar sin errores

Una vez creados los índices, puedes descomentar las líneas `orderBy` en:
- `src/lib/data.ts` (líneas 77 y 105)

## 📊 Estado Actual

- ✅ **Código funcionando** sin índices (ordenamiento en JavaScript)
- ⏳ **Pendiente:** Crear índices para mejor rendimiento
- 🔄 **Después de crear índices:** Descomentar `orderBy` para usar índices de Firebase
