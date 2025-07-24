import React from 'react';
import { useParams, Link } from 'react-router-dom'; 
import blogPosts, { type BlogPost } from '../data/blogPosts'; 

const BlogPostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const post = blogPosts.find((p: BlogPost) => p.slug === slug);

  if (!post) {
    return (
      <section style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1>404 - Entrada de Blog no Encontrada</h1>
        <p>Lo sentimos, la entrada de blog que buscas no existe o ha sido eliminada.</p>
        <Link to="/blog" style={{ color: '#3ecfcf', textDecoration: 'none', fontWeight: 'bold' }}>
          ← Volver al listado del Blog
        </Link>
      </section>
    );
  }

  // 4. Renderizar el contenido completo del post
  return (
    <section style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Enlace para volver al listado del blog */}
      <Link to="/blog" style={{ color: '#3ecfcf', textDecoration: 'none', fontWeight: 'bold', marginBottom: '1.5rem', display: 'inline-block' }}>
        ← Volver al blog
      </Link>

      {/* Imagen destacada del post (si existe) */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '2rem' }}
        />
      )}

      {/* Título del post */}
      <h1 style={{ color: '#2aa198', marginBottom: '0.5rem' }}>{post.title}</h1>

      {/* Información del autor y fecha */}
      <p style={{ fontSize: '0.9rem', color: '#777', marginBottom: '2rem' }}>
        Publicado el {post.date} por {post.author}
        {/* Etiquetas (si existen) */}
        {post.tags && post.tags.length > 0 && (
          <span style={{ marginLeft: '1rem' }}>
            Etiquetas: {post.tags.map(tag => (
              <span key={tag} style={{ background: '#eee', padding: '0.2rem 0.5rem', borderRadius: '4px', marginRight: '0.3rem', fontSize: '0.8rem' }}>
                {tag}
              </span>
            ))}
          </span>
        )}
      </p>


      <div style={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#333' }} dangerouslySetInnerHTML={{ __html: post.content }} />

    </section>
  );
};

export default BlogPostDetail;