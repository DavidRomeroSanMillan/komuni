import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AccessibilityButton from "./components/AccessibilidadBoton";


const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <AccessibilityButton />
  </>
);

export default Layout;
