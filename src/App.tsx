import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import Home from "./Home";
import About from "./About";
import Mapa from "./Mapa";
import Privacidad from "./Privacidad";
import ContactPage from "./ContactPage";
import Faq from "./Faq";
import Blog from "./Blog";
import BlogPostDetail from "./pages/BlogPostDetail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="contacto" element={<ContactPage />} />
        <Route path="blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="faq" element={<Faq />} />

      </Route>
    </Routes>
  );
}

export default App;
