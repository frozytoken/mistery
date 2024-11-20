import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./Home.css";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";

const Home = () => {
  const [isPumping, setIsPumping] = useState(false);
  const initialHeight = window.innerHeight * 0.05; // Altura inicial del 5%
  const [candleHeight, setCandleHeight] = useState(initialHeight); // Altura actual de la vela
  const [clicking, setClicking] = useState(false);
  const [isAtRest, setIsAtRest] = useState(true); // Nuevo estado para indicar reposo

  // Manejar clic o tap
  const handlePress = () => {
    setIsPumping(true);
    setClicking(true);
    setIsAtRest(false); // Desactivar reposo
    setCandleHeight((prev) => Math.min(prev + 50, window.innerHeight * 3)); // Subir más allá del viewport
  };

  // Manejar soltar clic o tap
  const handleRelease = () => {
    setIsPumping(false);
    setClicking(false);
  };

  // Reducir altura suavemente cuando no se clickea
  useEffect(() => {
    const interval = setInterval(() => {
      if (!clicking && candleHeight > initialHeight) {
        setCandleHeight((prev) => Math.max(prev - 10, initialHeight)); // Reducir pero nunca menos que la altura inicial
      }

      // Activar reposo solo si la altura coincide con la altura inicial
      if (!clicking && candleHeight <= initialHeight) {
        setIsAtRest(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [clicking, candleHeight, initialHeight]);

  // Renderizar la vela como un Portal
  const candlePortal = ReactDOM.createPortal(
    <div
      className={`candle ${isPumping ? "pumping" : ""} ${
        isAtRest ? "resting" : ""
      }`} // Agregar clases según estado
      style={{
        height: `${candleHeight}px`,
        zIndex: 1500, // Por encima del navbar
      }}
    >
      <div className="wick"></div>
    </div>,
    document.body // Renderizar directamente en el body
  );

  return (
    <div className="home-container">
      <h1 className="title">FROZY</h1>
      <div
        className="meme-container"
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
      >
        {/* Imagen del meme */}
        <img
          src={isPumping ? memePump : memeIdle}
          alt="Meme"
          className="meme"
        />
      </div>
      {/* Vela */}
      {candlePortal}
    </div>
  );
};

export default Home;
