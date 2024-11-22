import React, { useEffect, useState } from "react";
import "./BuySectionDesktop.css";
import "./BuySectionMobile.css";
import frameImage from "../assets/dvilframe.png";

const BuySection = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Detectar en la carga inicial
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Inicializar el widget de Jupiter
  useEffect(() => {
    const initializeWidget = () => {
      try {
        if (window.Jupiter) {
          const container = document.getElementById("jupiter-terminal");
          if (container && !container.hasChildNodes()) {
            console.log("Inicializando widget de Jupiter...");
            window.Jupiter.init({
              displayMode: "integrated",
              integratedTargetId: "jupiter-terminal",
              endpoint: "https://mainnet.helius-rpc.com/?api-key=9392e341-62a0-4643-ba6c-db26427e53b0", // Endpoint confiable
              formProps: {
                initialInputMint: "So11111111111111111111111111111111111111112", // SOL
                initialOutputMint: "C4jMVM797K2FqzbwxJn4TdPyuVhso7kCUu7UXRfjpump", // PUMP
                fixedInputMint: false, // Permitir cambiar la moneda de entrada
                fixedOutputMint: false, // Permitir cambiar la moneda de salida
                initialAmount: 1000000000, // Cantidad inicial
                exactIn: true,
              },
              strictTokenList: true, // Usar la lista estándar de tokens
              theme: "dark",
            });
          }
        } else {
          console.error("Jupiter no está disponible en el contexto global.");
        }
      } catch (error) {
        console.error("Error inicializando el widget de Jupiter:", error);
      }
    };

    // Inicializar directamente si el script ya está cargado
    if (window.Jupiter) {
      initializeWidget();
    } else {
      console.error("El script de Jupiter no está disponible.");
    }

    return () => {
      const container = document.getElementById("jupiter-terminal");
      if (container) container.innerHTML = ""; // Limpia el contenedor
    };
  }, []);

  return (
    <div className={isMobile ? "buy-section-mobile" : "buy-section-desktop"}>
      

      {/* Contenido Principal */}
      <div
        className={
          isMobile
            ? "buy-section-content-mobile"
            : "buy-section-content-desktop"
        }
      >
        {/* Texto */}
        <div className={isMobile ? "buy-text-mobile" : "buy-text-desktop"}>
          <h2
            className={isMobile ? "buy-title-mobile" : "buy-title-desktop"}
          >
            Get Your $DVIL
          </h2>
          <p
            className={
              isMobile
                ? "buy-description-mobile"
                : "buy-description-desktop"
            }
          >
            Unleash the power of the underworld and trade tokens like a true devil, fast and flawlessly with Jupiter Terminal.
          </p>
        </div>

        {/* Widget */}
        <div
          className={
            isMobile ? "widget-container-mobile" : "widget-container-desktop"
          }
        >
          <img
            src={frameImage}
            alt="Frame"
            className={
              isMobile
                ? "character-image-mobile"
                : "character-image-desktop"
            }
          />
          <div
            id="jupiter-terminal"
            className={
              isMobile
                ? "jupiter-terminal-mobile"
                : "jupiter-terminal-desktop"
            }
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BuySection;
