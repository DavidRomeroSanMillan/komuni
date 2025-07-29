import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AccessibilityButton from "./components/AccessibilidadBoton";
import ScrollToTop from "./components/ScrolltoTop";


const Layout = () => (
  <>
    <ScrollToTop />
    <Header />
    <Outlet />
    <Footer />
    <AccessibilityButton />
  </>
);

export default Layout;
