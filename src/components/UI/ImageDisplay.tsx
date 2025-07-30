// Componente para mostrar imágenes que pueden ser URLs o base64
import React from 'react';

interface ImageDisplayProps {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  height?: string | number;
}

export function ImageDisplay({ src, alt, className, style, width, height }: ImageDisplayProps) {
  if (!src) {
    return (
      <div 
        className={`image-placeholder ${className || ''}`}
        style={{ 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '14px',
          width: width || '100px',
          height: height || '100px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          ...style 
        }}
      >
        Sin imagen
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={(e) => {
        console.error('Error loading image:', e);
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
}

// Hook para verificar si una imagen es base64 o URL
export function useImageType(src: string | null): 'base64' | 'url' | null {
  if (!src) return null;
  return src.startsWith('data:') ? 'base64' : 'url';
}
