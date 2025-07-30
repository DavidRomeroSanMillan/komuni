// Utilidades para manejar imágenes sin Firebase Storage
export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function resizeImage(file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      // Configurar canvas
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convertir a blob
      canvas.toBlob((blob) => {
        const resizedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(resizedFile);
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}
