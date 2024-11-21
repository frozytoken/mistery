import React, { useState, useEffect } from "react";
import "./Home.css";
import Leaderboard from "./Leaderboard";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";
import database from "../firebase/firebaseConfig";
import { ref, runTransaction, onValue } from "firebase/database";

const Home = () => {
  const [isPumping, setIsPumping] = useState(false);
  const [candleHeight, setCandleHeight] = useState(window.innerHeight * 0.05);
  const [bubbles, setBubbles] = useState([]);
  const [userCountry, setUserCountry] = useState("UNKNOWN");
  const [bubbleCooldown, setBubbleCooldown] = useState(false);
  const [copyMessageVisible, setCopyMessageVisible] = useState(false);
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0);
  const [isAtRest, setIsAtRest] = useState(true);

  const contractAddress = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

  // Función para copiar el contrato al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);

    setCopyMessageVisible(true);
    setTimeout(() => {
      setCopyMessageVisible(false);
    }, 2000);
  };

  // Función para formatear números
  const formatNumber = (number) => {
    if (isNaN(number) || number === null || number === undefined) return "0";
    return Number(number).toLocaleString("en-US");
  };

  // Obtener el país del usuario
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch("https://ipwhois.app/json/");
        const data = await response.json();
        setUserCountry(data.country_code || "UNKNOWN");
      } catch (error) {
        console.error("Error al obtener el país del usuario:", error.message);
      }
    };

    fetchCountry();
  }, []);

  // Sincronizar totalGlobalClicks y la altura de la vela con Firebase
  useEffect(() => {
    const globalClickCountRef = ref(database, "clickCount");
    onValue(globalClickCountRef, (snapshot) => {
      setTotalGlobalClicks(snapshot.val() || 0);
    });

    const candleHeightRef = ref(database, "candleHeight");
    onValue(candleHeightRef, (snapshot) => {
      setCandleHeight(snapshot.val() || window.innerHeight * 0.05);
    });
  }, []);

  const incrementClicks = () => {
    const globalClicksRef = ref(database, "clickCount");
    const candleHeightRef = ref(database, "candleHeight");
    const countryClicksRef = ref(
      database,
      `countryClicks/${userCountry || "UNKNOWN"}/totalClicks`
    );

    runTransaction(globalClicksRef, (currentValue) => (currentValue || 0) + 1);
    runTransaction(countryClicksRef, (currentValue) => (currentValue || 0) + 1);

    // Incremento de la vela con dificultad creciente
    runTransaction(candleHeightRef, (currentHeight) => {
      const baseHeight = currentHeight || window.innerHeight * 0.05;
      const increment = Math.max(2 / Math.pow(baseHeight / (window.innerHeight * 0.1), 1.5), 0.5);
      return Math.min(baseHeight + increment, window.innerHeight * 3);
    });
  };

  const handlePress = () => {
    setIsPumping(true);
    setIsAtRest(false);

    incrementClicks();

    if (!bubbleCooldown) {
      const phrases = [
        "Keep clicking, you broke loser! This is your shot!",
        "Boom! Millionaire vibes incoming!",
        "Don’t stop now, we’re printing money!",
        "Come on, pump harder, loser! This ain't a charity!",
        "You're one click away from greatness, or absolute despair!",
        "Don’t stop now! Your mom is watching!",
        "Is that all you’ve got? My grandma clicks faster!",
        "Pump it, baby! Daddy needs a new yacht!",
        "What’s the matter? Too broke to click?",
        "Click like your life depends on it. Maybe it does.",
        "Stop whining and start winning!",
        "Click, click, click… You’re almost there! (Just kidding).",
        "I’ve seen turtles pump faster than this!",
        "Think of the glory! Think of the shame if you fail!",
        "Pump it harder! Your soul is almost mine!",
        "Is that sweat I see? Weaklings never win!",
        "Click or quit! No time for half-measures!",
        "Your fingers getting tired? Good!",
        "Remember: The house always wins. But try anyway!",
        "Oh, you think you’re good at this? Prove it!",
        "Every click brings you closer to… nothing. Keep going!",
        "You can stop anytime… but can you live with the shame?",
        "Click it like you mean it, you degenerate!",
        "Your luck’s turning… for the worse!",
        "Only losers stop. Are you a loser?",
        "Pump harder! The gods of chaos demand it!",
        "Click faster! This isn’t amateur hour!",
        "You’re so close… just kidding, you’re far off!",
        "Faster, mortal! The stakes are imaginary but your pride is real!",
        "Keep going! Your legacy is on the line!",
        "One more click… then another… then another…",
      ];
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setBubbles((prev) => [...prev, { id: Date.now(), text: phrase }]);
      setBubbleCooldown(true);

      setTimeout(() => {
        setBubbleCooldown(false);
      }, 4000);
    }
  };

  const handleRelease = () => {
    setIsPumping(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPumping && candleHeight > window.innerHeight * 0.05) {
        const newHeight = Math.max(candleHeight - 10, window.innerHeight * 0.05);
        setCandleHeight(newHeight);

        const candleHeightRef = ref(database, "candleHeight");
        runTransaction(candleHeightRef, () => newHeight);
      }

      if (!isPumping && candleHeight <= window.innerHeight * 0.05) {
        setIsAtRest(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPumping, candleHeight]);

  // Eliminar burbujas después de 3 segundos
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
      <h1 className="title">FIUmbi</h1>

      {/* Contenedor del contrato */}
      <div className="contract-wrapper">
        <div
          className="contract-container"
          onClick={(e) => {
            if (!e.target.closest(".buy-button")) {
              copyToClipboard();
            }
          }}
        >
          <span className="contract-address">{contractAddress}</span>
        </div>
        {copyMessageVisible && (
          <div className="copy-feedback">Contract address copied!</div>
        )}
      </div>

      {/* Contenedor del meme */}
      <div
        className="meme-container"
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
      >
        <img
          src={isPumping ? memePump : memeIdle}
          alt="Meme"
          className="meme"
        />
      </div>

      {/* Cuadro de PUMPS TOTALES */}
      <div className="total-pumps-counter">
        <span>{formatNumber(totalGlobalClicks)} PUMPS</span>
      </div>

      <div className="content-wrapper">
        <div
          className={`candle ${isPumping ? "pumping" : ""} ${
            isAtRest ? "resting" : ""
          }`}
          style={{
            height: `${candleHeight}px`,
            zIndex: 1,
          }}
        >
          <div className="wick"></div>
        </div>
        <Leaderboard />
      </div>

      {bubbles.map((bubble) => (
        <div key={bubble.id} className="bubble">
          {bubble.text}
        </div>
      ))}
    </div>
  );
};

export default Home;
