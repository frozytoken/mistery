import React, { useState, useEffect } from "react";
import "./Home.css";
import Leaderboard from "./Leaderboard";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";
import database from "../firebase/firebaseConfig";
import { ref, runTransaction } from "firebase/database";

const Home = () => {
  const [isPumping, setIsPumping] = useState(false);
  const [candleHeight, setCandleHeight] = useState(window.innerHeight * 0.05);
  const [clicking, setClicking] = useState(false);
  const [isAtRest, setIsAtRest] = useState(true);
  const [bubbles, setBubbles] = useState([]);
  const [userCountry, setUserCountry] = useState("UNKNOWN");

  // Frases específicas de Frozy
  const phrases = [
    "¡PUM! Otro clic más.",
    "¡Boom! Vamos a la cima.",
    "No pares ahora.",
    "Más alto, más fuerte.",
    "¡A por el récord!",
    "¿Es este el final?",
    "¡Tú puedes!",
    "Esto es adictivo, ¿eh?",
    "¡Otro y seguimos!",
    "¿Quién te detiene?",
    "¡Llevamos la delantera!",
    "Nada puede pararnos.",
    "¡Sigamos rompiendo límites!",
    "¿Es esto lo más alto?",
    "¡Más rápido!",
    "Vamos a romper el marcador.",
    "¡Un paso más cerca!",
    "Nadie nos iguala.",
    "¡La cima es nuestra!",
    "¿Eso es todo?",
    "¡Clic clic clic!",
    "¡No pares ahora!",
    "¡Estamos imparables!",
    "¡Así se hace!",
    "¡Wow, qué ritmo!",
    "¿Otro? Claro que sí.",
    "¡El cielo no es el límite!",
    "¡Rompiendo récords!",
    "¿Puedes más rápido?",
    "¡Esto es épico!",
  ];

  // Obtener país del usuario mediante ipwhois.app
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch("https://ipwhois.app/json/");
        if (!response.ok) throw new Error("Error al obtener datos de país");
        const data = await response.json();
        setUserCountry(data.country_code || "UNKNOWN");
      } catch (error) {
        console.error("Error al obtener el país del usuario:", error.message);
        setUserCountry("UNKNOWN");
      }
    };

    fetchCountry();
  }, []);

  // Incrementar clics en Firebase
  const incrementClicks = () => {
    const globalClicksRef = ref(database, "clickCount");
    const countryClicksRef = ref(
      database,
      `countryClicks/${userCountry || "UNKNOWN"}/totalClicks`
    );

    runTransaction(globalClicksRef, (currentValue) => (currentValue || 0) + 1);
    runTransaction(countryClicksRef, (currentValue) => (currentValue || 0) + 1);
  };

  // Manejar clic o tap
  const handlePress = () => {
    setIsPumping(true);
    setClicking(true);
    setIsAtRest(false);
    setCandleHeight((prev) => Math.min(prev + 50, window.innerHeight * 3));

    // Elegir frase aleatoria y mostrarla como burbuja
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setBubbles((prev) => [...prev, { id: Date.now(), text: phrase }]);

    incrementClicks();
  };

  const handleRelease = () => {
    setIsPumping(false);
    setClicking(false);
  };

  // Reducir altura suavemente cuando no se clickea
  useEffect(() => {
    const interval = setInterval(() => {
      if (!clicking && candleHeight > window.innerHeight * 0.05) {
        setCandleHeight((prev) =>
          Math.max(prev - 10, window.innerHeight * 0.05)
        );
      }

      if (!clicking && candleHeight <= window.innerHeight * 0.05) {
        setIsAtRest(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [clicking, candleHeight]);

  // Eliminar burbujas antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev.filter((bubble) => Date.now() - bubble.id < 3000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
        <img src={isPumping ? memePump : memeIdle} alt="Meme" className="meme" />
      </div>

      <div className="content-wrapper">
        {/* Vela */}
        <div
          className={`candle ${isPumping ? "pumping" : ""} ${
            isAtRest ? "resting" : ""
          }`}
          style={{
            height: `${candleHeight}px`,
            zIndex: 1, // Asegúrate de que esté por debajo del leaderboard
          }}
        >
          <div className="wick"></div>
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      {/* Burbujas */}
      {bubbles.map((bubble) => (
        <div key={bubble.id} className="bubble">
          {bubble.text}
        </div>
      ))}
    </div>
  );
};

export default Home;
