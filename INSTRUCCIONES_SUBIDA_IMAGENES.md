# 🔧 Solución para el problema de subida de imágenes

## Problema identificado:
Las imágenes no se suben debido a restricciones CORS de Firebase Storage.

## ✅ PASOS PARA SOLUCIONAR:

### 1. Configura Firebase Storage desde la consola web:

1. **Ve a Firebase Console**: https://console.firebase.google.com/
2. **Selecciona tu proyecto**: `komuni-app`
3. **Ve a Storage** en el menú lateral
4. **Haz clic en "Rules"**
5. **Reemplaza las reglas actuales con:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura para imágenes de reportes
    match /report_images/{allPaths=**} {
      allow read, write: if true;
    }
    // Permitir lectura por defecto
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
```

6. **Haz clic en "Publish"**

### 2. Configura CORS (Opcional pero recomendado):

Si tienes Google Cloud SDK instalado:

```bash
# En PowerShell o Command Prompt:
gcloud auth login
gcloud config set project komuni-app
gsutil cors set cors.json gs://komuni-app.firebasestorage.app
```

### 3. Prueba la funcionalidad:

1. Ve a: http://localhost:5176/
2. Navega a la página de reportes
3. Llena el formulario y selecciona una imagen
4. Envía el reporte
5. Revisa la consola del navegador (F12) para ver los logs

## 🎯 Estado actual:
- ✅ El reporte se enviará correctamente incluso si la imagen falla
- ✅ Logs detallados para diagnosticar problemas
- ✅ Mensajes claros sobre el estado de la imagen

## 📝 Nota:
Actualmente el reporte funciona sin imagen. Una vez configuradas las reglas de Firebase Storage, las imágenes se subirán automáticamente.
