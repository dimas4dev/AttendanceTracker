# 🚨 Sistema de Novedades - AsistenciaFácil

## 📋 Descripción

El sistema de novedades permite registrar información sobre estudiantes que no aparecen en la lista oficial o cualquier situación especial que requiera documentación.

## ✨ Características

### 🎯 **Funcionalidades Principales:**
- ✅ **Registro de novedades** con formulario completo
- ✅ **Selección de salón** desde dropdown
- ✅ **Información del estudiante** (nombre y documento)
- ✅ **Descripción detallada** de la razón
- ✅ **Historial de novedades** por salón
- ✅ **Integración con Firebase** para persistencia

### 📝 **Campos del Formulario:**
1. **Salón** - Selección del salón donde ocurrió la novedad
2. **Nombre del Estudiante** - Nombre completo del estudiante
3. **Identificación** - Número de documento o cédula
4. **Razón de la Novedad** - Descripción detallada de la situación

## 🎨 **Interfaz de Usuario**

### 📍 **Ubicación del Botón:**
- **Pestaña "Tomar Asistencia"**: Botón en la esquina superior derecha
- **Pestaña "Novedades"**: Botón principal para registrar nuevas novedades

### 🔄 **Flujo de Uso:**
1. **Acceder** a cualquier salón desde la página principal
2. **Hacer clic** en "Registrar Novedad"
3. **Completar** el formulario con la información requerida
4. **Enviar** el formulario
5. **Ver** la novedad registrada en la pestaña "Novedades"

## 🏗️ **Estructura Técnica**

### 📊 **Colección Firebase: `novedades`**
```json
{
  "noveltyId": {
    "classroomId": "salon-304",
    "studentName": "Juan Pérez",
    "studentDocument": "12345678",
    "reason": "Estudiante llegó tarde y no aparece en la lista",
    "createdBy": "Usuario",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 🔧 **Componentes:**
- **`NoveltyModal`** - Modal con formulario para registrar novedades
- **`NoveltiesList`** - Lista que muestra el historial de novedades
- **Integración** en la página de asistencia con nueva pestaña

## 📱 **Experiencia de Usuario**

### 🎯 **Casos de Uso Comunes:**
1. **Estudiante no en lista**: Cuando un estudiante asiste pero no aparece en la lista oficial
2. **Llegadas tardías**: Registrar estudiantes que llegan después de tomar asistencia
3. **Estudiantes nuevos**: Documentar estudiantes que se incorporan al salón
4. **Situaciones especiales**: Cualquier evento que requiera documentación

### 🎨 **Diseño Visual:**
- **Modal elegante** con validación en tiempo real
- **Formulario intuitivo** con campos claros
- **Tarjetas de novedades** con colores distintivos
- **Iconos descriptivos** para mejor UX

## 🔒 **Validaciones**

### ✅ **Validaciones del Formulario:**
- **Salón**: Campo obligatorio
- **Nombre**: Mínimo 2 caracteres
- **Documento**: Mínimo 6 caracteres
- **Razón**: Mínimo 10 caracteres

### 🛡️ **Seguridad:**
- **Validación del lado cliente** con Zod
- **Validación del lado servidor** en Firebase
- **Sanitización** de datos antes de guardar

## 📈 **Beneficios**

### 🎯 **Para los Administradores:**
- **Registro completo** de todas las situaciones especiales
- **Historial detallado** por salón y fecha
- **Trazabilidad** de quién registró cada novedad

### 👥 **Para los Usuarios:**
- **Interfaz simple** y fácil de usar
- **Proceso rápido** para registrar novedades
- **Confirmación visual** de registros exitosos

## 🚀 **Próximas Mejoras**

### 🔮 **Funcionalidades Futuras:**
- **Notificaciones** automáticas para administradores
- **Exportación** de reportes de novedades
- **Categorización** de tipos de novedades
- **Adjuntar archivos** o imágenes
- **Dashboard** de estadísticas de novedades

## 🛠️ **Mantenimiento**

### 📋 **Tareas Regulares:**
- **Revisar** novedades registradas semanalmente
- **Limpiar** novedades antiguas si es necesario
- **Actualizar** estudiantes faltantes en la lista principal

### 🔧 **Configuración:**
- **Índices de Firebase** configurados para consultas eficientes
- **Validaciones** personalizables según necesidades
- **Estilos** adaptables al tema de la aplicación
