import React, { useState, useEffect, useRef } from "react";
import DexscreenerIcon from "../assets/dexs.webp";
import DexToolsIcon from "../assets/dexstools.webp";
import XLogo from "../assets/x.png";
import "./NavbarDesktop.css";
import "./NavbarMobile.css";

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false); // Detecta si es versión móvil
  const [menuOpen, setMenuOpen] = useState(false); // Estado del menú hamburguesa
  const [showSocials, setShowSocials] = useState(true); // Controla las redes sociales
  const [lastScrollY, setLastScrollY] = useState(0); // Controla el scroll previo
  const menuRef = useRef();

  // Detectar el tamaño de la pantalla para cambiar entre mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Mobile: ancho <= 768px
    };
    handleResize(); // Detectar el tamaño inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ocultar/mostrar redes sociales dependiendo del scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowSocials(false); // Ocultar redes sociales al bajar
      } else {
        setShowSocials(true); // Mostrar redes sociales al subir
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Controla el menú hamburguesa
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Cerrar el menú hamburguesa al hacer clic fuera
  const closeMenuOnOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false);
    }
  };

  // Añade el listener para clics fuera del menú
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener("mousedown", closeMenuOnOutsideClick);
    } else {
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
    }
    return () =>
      document.removeEventListener("mousedown", closeMenuOnOutsideClick);
  }, [menuOpen]);

  return (
    <>
      {/* Fondo translúcido cuando el menú está abierto */}
      {menuOpen && <div className="overlay"></div>}
      <nav
        className={`navbar ${
          isMobile ? "mobile-navbar" : "desktop-navbar"
        }`} // Cambia entre clases de desktop y mobile
      >
        {isMobile ? (
          <>
            {/* Hamburguesa */}
            <div className="hamburger" onClick={toggleMenu}>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
              <div className="hamburger-line"></div>
            </div>

            {/* Redes sociales flotantes cuando está contraído */}
            {!menuOpen && (
              <div
                className={`mobile-social-box ${
                  showSocials ? "visible" : "hidden"
                }`}
              >
                <div className="mobile-social-icons">
                  <a
                    href="https://dexscreener.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={DexscreenerIcon} alt="Dexscreener" />
                  </a>
                  <a
                    href="https://dexstools.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={DexToolsIcon} alt="DexTools" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={XLogo} alt="X" />
                  </a>
                  <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">
  <img src={require('../assets/telegram.png')} alt="Telegram" />
</a>
                  <a href="#buy" className="navbar-buy-mobile">
                    BUY
                  </a>
                </div>
              </div>
            )}

            {/* Menú lateral */}
            <div
              className={`navbar-menu ${menuOpen ? "open" : ""}`}
              ref={menuRef}
            >
              <div className="navbar-menu-logo">
  <h1 className="navbar-text">DVIL.</h1>
  <img src={require('../assets/dvil.png')} alt="Dvil Logo" className="logo-image" />
</div>
              <div className="navbar-menu-divider navbar-menu-divider-top"></div>
              <div className="navbar-menu-links">
                <a href="#pfp-customizer" onClick={toggleMenu}>
                  CUSTOMIZER
                </a>
                <a
                  href="https://memedepot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={toggleMenu}
                >
                  MEMEDEPOT
                </a>
                <a href="#about" onClick={toggleMenu}>
                  HOW TO BUY
                </a>
                <a href="#store" onClick={toggleMenu}>
                  STORE
                </a>
              </div>
              <div className="navbar-menu-divider navbar-menu-divider-bottom"></div>
              <div className="navbar-menu-socials">
                <a
                  href="https://dexscreener.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={DexscreenerIcon} alt="Dexscreener" />
                </a>
                <a
                  href="https://dexstools.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={DexToolsIcon} alt="DexTools" />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={XLogo} alt="X" />
                </a>
                <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">
  <img src={require('../assets/telegram.png')} alt="Telegram" />
</a>
              </div>
            </div>
          </>
        ) : (
          // Navbar para escritorio
          <div className="desktop-navbar-container">
            <div className="navbar-logo">
  <h1 className="navbar-text">DVIL.</h1>
  <img src={require('../assets/dvil.png')} alt="Dvil Logo" className="logo-image" />
</div>
            <div className="desktop-navbar-links">
              <a href="#pfp-customizer">CUSTOMIZER</a>
              <a
                href="https://memedepot.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                MEMEDEPOT
              </a>
              <a href="#about">HOW TO BUY</a>
              <a href="#store">STORE</a>
            </div>
            <div className="desktop-navbar-icons">
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={DexscreenerIcon} alt="Dexscreener" />
              </a>
              <a
                href="https://dexstools.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={DexToolsIcon} alt="DexTools" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={XLogo} alt="X" />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer">
  <img src={require('../assets/telegram.png')} alt="Telegram" />
</a>
              <a href="#buy" className="desktop-navbar-buy">
                BUY
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
