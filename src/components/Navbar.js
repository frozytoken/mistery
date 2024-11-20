import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import DexscreenerIcon from '../assets/dexs.webp'; // Importa la imagen de Dexscreener
import DexToolsIcon from '../assets/dexstools.webp'; // Importa la imagen de DexTools
import XLogo from '../assets/x.avif'; // Importa la imagen de X
import './Navbar.css';

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    if (window.scrollY > lastScrollY) {
      setShowNavbar(false); // Oculta el navbar si se hace scroll hacia abajo
    } else {
      setShowNavbar(true); // Muestra el navbar si se hace scroll hacia arriba
    }
    setLastScrollY(window.scrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <nav className={`navbar ${showNavbar ? 'navbar-show' : 'navbar-hide'}`}>
      <div className="navbar-container">
        {/* Logo a la izquierda */}
        <div className="navbar-logo">
          <h1>ICEE</h1>
        </div>

        {/* Secciones en el centro, ahora alineadas a la izquierda */}
        <div className="navbar-links">
          <a href="#pfp-customizer">CUSTOMIZER</a>
          <a href="https://memedepot.com" target="_blank" rel="noopener noreferrer">MEMEDEPOT</a>
          <a href="#about">HOW TO BUY</a>
          <a href="#store">STORE</a>
        </div>

        {/* Redes sociales e íconos a la derecha */}
        <div className="navbar-icons">
          <a href="https://dexscreener.com" target="_blank" rel="noopener noreferrer" title="Dexscreener">
            <img src={DexscreenerIcon} alt="Dexscreener" className="navbar-icon-image" />
          </a>
          <a href="https://dexstools.io" target="_blank" rel="noopener noreferrer" title="DexTools">
            <img src={DexToolsIcon} alt="DexTools" className="navbar-icon-image" />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" title="X">
            <img src={XLogo} alt="X Logo" className="navbar-icon-image" />
          </a>
          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" title="Telegram">
            <FontAwesomeIcon icon={faTelegram} className="navbar-icon" />
          </a>
          <a href="#buy" className="navbar-buy">
            BUY
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
