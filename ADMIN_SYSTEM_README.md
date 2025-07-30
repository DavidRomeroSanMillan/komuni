# 🛡️ Sistema de Administradores - Komuni

## 📋 Funcionalidad Implementada

Se ha implementado un sistema de roles que permite diferenciar entre usuarios normales y administradores. **Solo los administradores pueden eliminar reportes**.

## 🔧 Cambios Realizados

### 1. **Modificaciones en el Perfil de Usuario**
- ✅ Agregado campo `isAdmin` al interface `UserProfile`
- ✅ Función `isAdmin()` para verificar rol de administrador
- ✅ Función `makeAdmin()` para convertir usuarios en administradores
- ✅ Visualización del rol en la página de perfil

### 2. **Restricciones en el Mapa**
- ✅ El botón "Borrar" solo se muestra a administradores
- ✅ Verificación adicional en la función `deleteReporte()` 
- ✅ Mensajes de error para usuarios sin permisos

### 3. **Seguridad**
- ✅ Validación tanto en frontend como en backend
- ✅ Solo administradores pueden eliminar reportes
- ✅ Usuarios normales mantienen todos los demás permisos

## 🎯 Cómo Funciona

### **Para Usuarios Normales:**
- ✅ Crear reportes
- ✅ Editar reportes 
- ✅ Comentar en reportes
- ✅ Ver reportes en el mapa
- ❌ **NO pueden eliminar reportes**

### **Para Administradores:**
- ✅ Todas las funciones de usuarios normales
- ✅ **Eliminar reportes** (botón de borrar visible)
- ✅ Icono de administrador en el perfil (👑)
- ✅ **Cambiar su propio rol** entre Administrador ↔ Usuario

## 🧪 Testing

### **Administradores Predefinidos:**
- ✅ **`ivettemdv@gmail.com`** es administrador automáticamente
- ✅ Se convierte en admin al registrarse o hacer login

### **Crear Otros Administradores:**

1. **Regístrate o inicia sesión** con cualquier usuario
2. **Abre la consola del navegador** (F12)
3. **Ejecuta el comando:**
   ```javascript
   makeAdmin("tu-email@ejemplo.com")
   ```
4. **Recarga la página** para ver los cambios

### **Cambiar Rol (Solo Administradores):**

1. **Inicia sesión como administrador** (ej: `ivettemdv@gmail.com`)
2. **Ve a tu perfil**
3. **Haz clic en "Cambiar Rol"** junto al badge de administrador
4. **Confirma el cambio** en el diálogo
5. **Tu rol cambiará** entre Administrador ↔ Usuario

### **Verificar Funcionalidad:**

1. **Como usuario normal:**
   - Ve al mapa
   - Haz clic en cualquier reporte
   - El popup NO tendrá botón "Borrar"

2. **Como administrador:**
   - Ve al mapa  
   - Haz clic en cualquier reporte
   - El popup SÍ tendrá botón "Borrar"
   - Al hacer clic, aparece confirmación
   - El reporte se elimina correctamente

3. **Verificar perfil:**
   - Ve a tu perfil
   - En la sección de información aparecerá:
     - 👤 Usuario (usuarios normales)
     - 👑 Administrador (administradores)

## 🔒 Seguridad Implementada

### **Frontend:**
- El botón de borrar solo se renderiza para administradores
- Verificación del rol antes de mostrar elementos UI

### **Backend (api.ts):**
- Validación del rol de administrador antes de eliminar
- Mensaje de error si no es administrador
- Verificación de autenticación

### **Ejemplo de Error para No Administradores:**
```
Error: Solo los administradores pueden eliminar reportes
```

## 📝 Estructura del Código

### **Archivos Modificados:**
- `src/contexts/AuthContextLocalStorage.tsx` - Sistema de roles
- `src/Mapa.tsx` - Restricción del botón borrar
- `src/pages/Perfil.tsx` - Visualización del rol
- `src/pages/Perfil.css` - Estilos del rol
- `services/api.ts` - Validación backend

### **Funciones Principales:**
- `isAdmin()` - Verificar si usuario es administrador
- `makeAdmin(email)` - Convertir usuario en administrador
- `toggleAdminRole()` - Cambiar propio rol (solo admins)
- `deleteReporte(id)` - Eliminar reporte (solo admins)

## 🎨 Interfaz Visual

### **Badges de Rol:**
- **👤 Usuario:** Azul claro
- **👑 Administrador:** Dorado/naranja

### **Botones:**
- **Usuarios normales:** Solo ven "Editar" en popups
- **Administradores:** Ven "Editar" y "Borrar" en popups

## 📖 Para Desarrolladores

### **Verificar Rol Programáticamente:**
```typescript
import { useAuth } from './contexts/AuthContextLocalStorage';

function MiComponente() {
  const { isAdmin } = useAuth();
  
  return (
    <div>
      {isAdmin() && (
        <button>Solo visible para admins</button>
      )}
    </div>
  );
}
```

### **Crear Administrador Programáticamente:**
```typescript
const { makeAdmin } = useAuth();
await makeAdmin("admin@ejemplo.com");
```

## ✅ Estado de la Implementación

- ✅ **Completado:** Sistema de roles básico
- ✅ **Completado:** `ivettemdv@gmail.com` como admin automático
- ✅ **Completado:** Función para cambiar rol propio (admins)
- ✅ **Completado:** Restricción de eliminación de reportes  
- ✅ **Completado:** Interfaz visual diferenciada
- ✅ **Completado:** Validaciones de seguridad
- ✅ **Completado:** Sistema de testing

¡El sistema está listo para usar! 🚀

## 🔄 Funcionalidad de Cambio de Rol

Los administradores pueden **alternar su rol** entre:
- 👑 **Administrador:** Todos los permisos
- 👤 **Usuario:** Sin permisos de eliminación

Esto permite a los administradores experimentar la aplicación desde la perspectiva de usuarios normales cuando lo deseen.
