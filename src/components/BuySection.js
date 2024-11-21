import React, { useEffect, useState } from "react";
import "./BuySectionDesktop.css";
import "./BuySectionMobile.css";
import frameImage from "../assets/dvilframe.png";

const BuySection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Manejar cambio de tamaño de pantalla
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Función para inicializar el widget
    const initializeWidget = () => {
      try {
        if (window.Jupiter) {
          const container = document.getElementById("jupiter-terminal");
          if (container && !container.hasChildNodes()) {
            // Inicializar solo si el contenedor está vacío
            window.Jupiter.init({
                displayMode: "integrated",
                integratedTargetId: "jupiter-terminal",
                endpoint: "https://attentive-icy-snowflake.solana-mainnet.quiknode.pro/43b199e39bdd7f1648b4b94658d3b471caac7ee4/",
                defaultInputMint: "C4jMVM797K2FqzbwxJn4TdPyuVhso7kCUu7UXRfjpump", // PUMP
                defaultOutputMint: "So11111111111111111111111111111111111111112", // SOL
                theme: "dark",
                formProps: {
                  initialAmount: 1,
                  fixedAmount: false,
                  fixedInputMint: false, // Permitir cambiar la moneda de entrada
                  fixedOutputMint: false, // Permitir cambiar la moneda de salida
                  exactIn: true,
                },
              });
          }
        }
      } catch (error) {
        console.error("Error inicializando el widget de Jupiter:", error.message);
      }
    };

    // Agregar el script solo una vez
    const existingScript = document.querySelector("script[src='https://terminal.jup.ag/main-v3.js']");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://terminal.jup.ag/main-v3.js";
      script.async = true;

      script.onload = () => {
        initializeWidget();
      };

      script.onerror = () => {
        console.error("Error al cargar el script de Jupiter.");
      };

      document.body.appendChild(script);
    } else {
      initializeWidget(); // Si el script ya existe, solo inicializa el widget
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Sincronizar con el tamaño de pantalla

  return (
    <div className={isMobile ? "buy-section-mobile" : "buy-section-desktop"}>
      {/* Transición Suave */}
      <div className={isMobile ? "buy-shape-top-mobile" : "buy-shape-top-desktop"}></div>

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
          <h2 className={isMobile ? "buy-title-mobile" : "buy-title-desktop"}>
            Get Your $DVIL
          </h2>
          <p
            className={isMobile ? "buy-description-mobile" : "buy-description-desktop"}
          >
            Swap tokens like PUMP and SOL effortlessly using Jupiter Terminal.
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
              isMobile ? "character-image-mobile" : "character-image-desktop"
            }
          />
          <div
            id="jupiter-terminal"
            className={
              isMobile ? "jupiter-terminal-mobile" : "jupiter-terminal-desktop"
            }
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BuySection;
