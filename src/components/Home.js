import React, { useState, useEffect } from "react";
import "./HomeDesktop.css";
import "./HomeMobile.css";
import MiniGame from "./MiniGame"; // Importamos el componente del minijuego
import Leaderboard from "./Leaderboard";
import flash from "../assets/flash.png";
import moon from "../assets/moon.png";
import database from "../firebase/firebaseConfig";
import { ref, onValue, runTransaction } from "firebase/database";

const Home = () => {
  const [bubbles, setBubbles] = useState([]);
  const [userCountry, setUserCountry] = useState("UNKNOWN");
  const [bubbleCooldown, setBubbleCooldown] = useState(false);
  const [copyMessageVisible, setCopyMessageVisible] = useState(false);
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0);
  const [totalSuccesses, setTotalSuccesses] = useState(0); // Define el estado aquí
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const successCountRef = ref(database, "successCount");

    // Sincroniza el contador de éxitos con Firebase
    onValue(successCountRef, (snapshot) => {
      setTotalSuccesses(snapshot.val() || 0);
    });
  }, []);

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

  useEffect(() => {
    const globalClickCountRef = ref(database, "clickCount");

    onValue(globalClickCountRef, (snapshot) => {
      setTotalGlobalClicks(snapshot.val() || 0);
    });
  }, []);

  const incrementClicks = () => {
    const globalClicksRef = ref(database, "clickCount");

    runTransaction(globalClicksRef, (currentValue) => (currentValue || 0) + 1).catch((error) =>
      console.error("Error incrementando los clics globales:", error)
    );

    const countryClicksRef = ref(
      database,
      `countryClicks/${userCountry || "UNKNOWN"}/totalClicks`
    );

    // Incrementar el contador global de clics
    runTransaction(globalClicksRef, (currentValue) => (currentValue || 0) + 1);

    // Incrementar el contador de clics por país
    runTransaction(countryClicksRef, (currentValue) => (currentValue || 0) + 1);
  };

  // Incrementar éxitos globales en Firebase
  const incrementSuccesses = () => {
    const successCountRef = ref(database, "successCount");
    runTransaction(successCountRef, (currentValue) => (currentValue || 0) + 1).catch((error) =>
      console.error("Error incrementando éxitos globales:", error)
    );
  };

  const handlePress = () => {
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

  // Eliminar burbujas después de 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => prev.filter((bubble) => Date.now() - bubble.id < 3000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Detecta Version movil o desktop
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Define móvil como ≤ 768px
    };

    handleResize(); // Ejecuta en la carga inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`home-container ${isMobile ? "home-container-mobile" : "home-container-desktop"}`}>
      {/* Filtro de ruido */}
      <div className="noise-filter"></div>

      {/* Imágenes decorativas */}
      <div className="decorative-images">
        <img src={flash} alt="Flash" className="flash" />
        <img src={moon} alt="Moon" className="moon" />
      </div>

      <h1 className="title-home">dvil</h1>

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
        {copyMessageVisible && <div className="copy-feedback">Contract address copied!</div>}
      </div>

      {/* MiniGame */}
      <MiniGame handlePress={handlePress} incrementSuccesses={incrementSuccesses} />

      {/* Cuadro de PUMPS TOTALES */}
      <div className="total-pumps-counter">
        <span>{formatNumber(totalGlobalClicks)} PUMPS - {formatNumber(totalSuccesses)} SUCCES</span>
      </div>

      {/* Leaderboard */}
      <Leaderboard />

      {/* Burbujas de frases */}
      {bubbles.map((bubble) => (
        <div key={bubble.id} className="bubble">
          {bubble.text}
        </div>
      ))}
    </div>
  );
};

export default Home;
