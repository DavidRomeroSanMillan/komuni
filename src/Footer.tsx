import { NavLink } from "react-router-dom";
// import { useEffect, useState } from "react";

function Footer() {
  return (
    <footer className="footer ">
      <div>
        <div>
          <ul className="menu">
            <li className="menu_item">
               <NavLink
                  to="/privacidad"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                >
                  Política de privacidad
                </NavLink>
            </li>
            <li className="menu_item">
               <NavLink
                  to="/about"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                >
                  Sobre KOMUNI
                </NavLink>
            </li>
            <li className="menu_item">
               <NavLink
                  to="/privacidad"
                  className={({ isActive }: { isActive: boolean }) =>
                    "menu_link" + (isActive ? " active" : "")
                  }
                >
                  Política de privacidad
                </NavLink>
            </li>
          </ul>
        </div>

        <div className="">
          <p className="">
            {" "}
            <span>Email: </span>
            <span>
              {" "}
              <a href="#0" className="">
                komunitgn@gmail.com{" "}
              </a>
            </span>
          </p>
          <p className="">
        {" "}
        <small>
          &copy; {new Date().getFullYear()} Komuni. Plataforma colaborativa de
          accesibilidad.
        </small>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
