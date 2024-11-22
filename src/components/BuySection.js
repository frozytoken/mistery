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
        const container = document.getElementById("jupiter-terminal");
        if (container && window.Jupiter && !container.hasChildNodes()) {
          console.log("Inicializando widget de Jupiter...");
          window.Jupiter.init({
            displayMode: "integrated",
            integratedTargetId: "jupiter-terminal",
            endpoint: "https://mainnet.helius-rpc.com/?api-key=9392e341-62a0-4643-ba6c-db26427e53b0",
            formProps: {
              initialInputMint: "So11111111111111111111111111111111111111112",
              initialOutputMint: "C4jMVM797K2FqzbwxJn4TdPyuVhso7kCUu7UXRfjpump",
              fixedInputMint: false,
              fixedOutputMint: false,
              initialAmount: 1000000000,
              exactIn: true,
            },
            strictTokenList: true,
            theme: "dark",
          });
        }
      } catch (error) {
        console.error("Error inicializando el widget de Jupiter:", error);
      }
    };

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
      {isMobile ? (
        // Versión móvil
        <div className="buy-section-content-mobile">
          <div className="buy-text-mobile">
            <h2 className="buy-title-mobile">Get Your $DVIL</h2>
            <p className="buy-description-mobile">
              Unleash the power of the underworld and trade tokens like a true
              devil, fast and flawlessly with Jupiter Terminal.
            </p>
          </div>

          <div className="widget-container-mobile">
            <img
              src={frameImage}
              alt="Frame"
              className="character-image-mobile"
            />
            <div id="jupiter-terminal" className="jupiter-terminal-mobile"></div>
          </div>

          <div className="platforms-container-mobile">
            <h3 className="platforms-title-mobile">
              $DVIL can be found on these platforms
            </h3>
            <div className="platforms-buttons-mobile">
              {[
                "CoinMarketCap",
                "CoinGecko",
                "Dexscreener",
                "Birdeye",
                "Dapplist",
                "Cryptorank",
                "Coinranking",
                "Cryptocompare",
                "Solscan",
                "NTM",
              ].map((platform) => (
                <button
                  key={platform}
                  className="platform-button-mobile"
                  onClick={() => window.open("#", "_blank")}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Versión desktop
        <div className="buy-section-content-desktop">
          <div className="buy-text-desktop">
            <h2 className="buy-title-desktop">Get Your $DVIL</h2>
            <p className="buy-description-desktop">
              Unleash the power of the underworld and trade tokens like a true
              devil, fast and flawlessly with Jupiter Terminal.
            </p>
          </div>

          <div className="widget-container-desktop">
            <img
              src={frameImage}
              alt="Frame"
              className="character-image-desktop"
            />
            <div
              id="jupiter-terminal"
              className="jupiter-terminal-desktop"
            ></div>
          </div>

          <div className="platforms-container">
            <h3 className="platforms-title">
              $DVIL can be found on these platforms
            </h3>
            <div className="platforms-buttons">
              {[
                "CoinMarketCap",
                "CoinGecko",
                "Dexscreener",
                "Birdeye",
                "Dapplist",
                "Cryptorank",
                "Coinranking",
                "Cryptocompare",
                "Solscan",
                "NTM",
              ].map((platform) => (
                <button
                  key={platform}
                  className="platform-button"
                  onClick={() => window.open("#", "_blank")}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuySection;
