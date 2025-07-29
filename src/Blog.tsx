// src/pages/Blog.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import blogPosts, { type BlogPost } from '../src/data/blogPosts';
import './Blog.css'; 

const Blog: React.FC = () => {
  return (
    <section className="page-content-wrapper"> 
      <h1>Nuestro Blog</h1>
      <p style={{ fontSize: "1.2rem", color: "#20706e", marginBottom: 32 }}> 
        Aquí encontrarás las últimas noticias, artículos y actualizaciones sobre accesibilidad y nuestra comunidad.
      </p>

      <div className="blog-posts-list">
        {blogPosts.map((post: BlogPost) => (
          <div
            key={post.id}
            className="blog-post-card" 
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="blog-post-card-image" 
              />
            )}
            <div>
              <h2>{post.title}</h2> {/* Sus estilos están ahora en .blog-post-card h2 */}
              <p className="blog-post-date-author"> {/* Aplica la clase aquí */}
                Publicado el {post.date} por {post.author}
              </p>
              <p>{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="blog-post-read-more"> {/* Aplica la clase aquí */}
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