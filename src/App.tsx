import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import Home from "./Home";
import About from "./About";
import Mapa from "./Mapa";
import Privacidad from "./Privacidad";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="privacidad" element={<Privacidad />} />

        {/* <Route path="contact" element={<Contact />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
