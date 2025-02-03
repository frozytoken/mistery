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

  // Función para hacer scroll hacia una sección
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId).scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };
  const handleScroll = (e) => {
    e.preventDefault();
    const targetId = e.target.getAttribute("href").slice(1); // Extrae el id del href
    const targetSection = document.getElementById(targetId);
  
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error(`No se encontró la sección con id ${targetId}`);
    }
  };
  
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
                  <button
                    onClick={() => window.open("https://jup.ag/swap/SOL-GHAgf97Y4xsfRX61WoEx3b9mg6iDMQD6AsgnzEKopump", "_blank")}
                    className="navbar-buy-mobile"
                  >
                    BUY
                  </button>
                </div>
              </div>
            )}

            {/* Menú lateral */}
            <div
              className={`navbar-menu ${menuOpen ? "open" : ""}`}
              ref={menuRef}
            >
              <div className="navbar-menu-logo">
                <h1 className="navbar-text">IMP.</h1>
                <img src={require('../assets/dvil.png')} alt="Dvil Logo" className="logo-image" />
              </div>
              <div className="navbar-menu-divider navbar-menu-divider-top"></div>
              <div className="navbar-menu-links">
                <a href="#customizer" onClick={() => { scrollToSection("customizer"); toggleMenu(); }}>CUSTOMIZER</a>
                <a href="#how-to-buy" onClick={() => { scrollToSection("how-to-buy"); toggleMenu(); }}>HOW TO BUY</a>
                <a href="#about" onClick={() => { scrollToSection("about"); toggleMenu(); }}>ABOUT</a>
                <a href="#community" onClick={() => { scrollToSection("community"); toggleMenu(); }}>COMMUNITY</a>
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
              <h1
                className="navbar-text"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                IMP.
              </h1>
              <img
                src={require('../assets/dvil.png')}
                alt="Dvil Logo"
                className="logo-image"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              />
            </div>

            <div className="desktop-navbar-links">
            <a href="#customizer" onClick={handleScroll}>CUSTOMIZER</a>
              <a href="#how-to-buy" onClick={handleScroll}>HOW TO BUY</a>
              <a href="#about" onClick={handleScroll}>ABOUT</a>
              <a href="#community" onClick={handleScroll}>COMMUNITY</a>
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
              <button
                onClick={() => window.open("https://jup.ag/swap/SOL-GHAgf97Y4xsfRX61WoEx3b9mg6iDMQD6AsgnzEKopump", "_blank")}
                className="desktop-navbar-buy"
              >
                BUY
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
