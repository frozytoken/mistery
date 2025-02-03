import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MemeBuilder.css"; // Estilos para escritorio
import "./MemeBuilderMobile.css"; // Estilos para móvil
import logo from "../../assets/log1.png";
import twitterIcon from "../../assets/twitter-icon.png";
import telegramIcon from "../../assets/telegram-icon.png";

const MemeBuilder = () => {
  const [, setImage] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      navigate("/editor1", { state: { image: URL.createObjectURL(file) } });
    }
  };
// Función para redirigir a la página principal al hacer clic en el logo
const handleLogoClick = () => {
  navigate("/");
};

  return (
    <div
      className={`meme-builder-container ${
        isMobile ? "mobile-meme-builder-container" : ""
      }`}
    >
      <header
        className={`header-meme ${isMobile ? "mobile-header-meme" : ""}`}
      >
         <img
          src={logo}
          alt="Logo"
          className={`logo ${isMobile ? "mobile-logo" : ""}`}
          onClick={handleLogoClick} // Redirige a la página principal al hacer clic
        />
        <div
          className={`header-actions-meme ${isMobile ? "mobile-header-actions-meme" : ""}`}
        >
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={twitterIcon}
              alt="Twitter"
              className={`nav-icon ${isMobile ? "mobile-nav-icon" : ""}`}
            />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <img
              src={telegramIcon}
              alt="Telegram"
              className={`nav-icon ${isMobile ? "mobile-nav-icon" : ""}`}
            />
          </a>
          <button
  className={`buy-dvil-button-meme ${isMobile ? "mobile-buy-dvil-button-meme" : ""}`}
  onClick={() => window.open("https://jup.ag/swap/SOL-GHAgf97Y4xsfRX61WoEx3b9mg6iDMQD6AsgnzEKopump", "_blank")}
>
  BUY $IMP
</button>
        </div>
      </header>

      <main
        className={`upload-area ${isMobile ? "mobile-upload-area" : ""}`}
        onClick={() => document.getElementById("imageUploadInput").click()}
      >
        <h1
          className={`title-meme ${isMobile ? "mobile-title-meme" : ""}`}
        >
          IMP MEME BUILDER
        </h1>
        <p
          className={`subtitle ${isMobile ? "mobile-subtitle" : ""}`}
        >
          CLICK TO UPLOAD AN IMAGE AND START EDITING
        </p>
        <input
          id="imageUploadInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </main>
    </div>
  );
};

export default MemeBuilder;
