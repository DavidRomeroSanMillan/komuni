// src/pages/Blog.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // ¡Asegúrate de importar Link!
import blogPosts, { type BlogPost } from '../src/data/blogPosts';

const Blog: React.FC = () => {
  return (
    <section style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Nuestro Blog</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '2rem' }}>
        Aquí encontrarás las últimas noticias, artículos y actualizaciones sobre accesibilidad y nuestra comunidad.
      </p>

      <div className="blog-posts-list">
        {blogPosts.map((post: BlogPost) => (
          <div
            key={post.id}
            className="blog-post-card"
            style={{
              marginBottom: '1.5rem',
              padding: '1.2rem',
              border: '1px solid #eee',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                style={{ width: '120px', height: 'auto', borderRadius: '4px', objectFit: 'cover' }}
              />
            )}
            <div>
              <h2 style={{ marginTop: 0, color: '#2aa198' }}>{post.title}</h2>
              <p style={{ fontSize: '0.9rem', color: '#777' }}>
                Publicado el {post.date} por {post.author}
              </p>
              <p>{post.excerpt}</p>
              {/* MODIFICACIÓN AQUÍ: Usa Link y el slug para la URL */}
              <Link to={`/blog/${post.slug}`} style={{ color: '#3ecfcf', textDecoration: 'none', fontWeight: 'bold' }}>
                Leer más →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;