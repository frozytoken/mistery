import React, { useState, useEffect } from "react";
import "./HomeDesktop.css";
import "./HomeMobile.css";
import Leaderboard from "./Leaderboard";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";
import flash from "../assets/flash.png"; // Importa flash.png
import moon from "../assets/moon.png"; // Importa moon.png
import clickSound from "../assets/audio/click-sound.wav";
import successSound from "../assets/audio/success-sound.wav";
import database from "../firebase/firebaseConfig";
import { ref, runTransaction, onValue, set } from "firebase/database";


const Home = () => {
  const [isPumping, setIsPumping] = useState(false);
  const [candleHeight, setCandleHeight] = useState(window.innerHeight * 0.05);
  const [bubbles, setBubbles] = useState([]);
  const [userCountry, setUserCountry] = useState("UNKNOWN");
  const [bubbleCooldown, setBubbleCooldown] = useState(false);
  const [copyMessageVisible, setCopyMessageVisible] = useState(false);
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0);
  const [globalIsPumping, setGlobalIsPumping] = useState(false);
  const [isAtRest, setIsAtRest] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [totalSuccesses, setTotalSuccesses] = useState(0); // Nuevo estado para éxitos
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false); // Para controlar el umbral
  const [isSuccessActive, setIsSuccessActive] = useState(false);
  const [clickAudio, setClickAudio] = useState(null);
  const [successAudio, setSuccessAudio] = useState(null);
  const [clickCooldown, setClickCooldown] = useState(false);
  const [successCooldown, setSuccessCooldown] = useState(false);


  const contractAddress = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  
// Inicializar los audios en useEffect
useEffect(() => {
  const clickSoundInstance = new Audio(clickSound);
  const successSoundInstance = new Audio(successSound);

  clickSoundInstance.volume = 0.1; // Reducir volumen al 20%
  clickSoundInstance.preload = "auto";

  successSoundInstance.volume = 1.0; // Success sin cambios (100% de volumen)
  successSoundInstance.preload = "auto";

  setClickAudio(clickSoundInstance);
  setSuccessAudio(successSoundInstance);
}, []);
    // Función para reproducir el sonido del clic con cooldown
const playClickSound = () => {
  if (!clickCooldown && clickAudio) {
    setClickCooldown(true);
    clickAudio.currentTime = 0;
    clickAudio.play().catch((error) => {
      console.error("Error al reproducir clickSound:", error);
    });

    setTimeout(() => {
      setClickCooldown(false);
    }, 100); // Cooldown de 100ms
  }
};

// Función para reproducir el sonido del éxito con cooldown
const playSuccessSound = () => {
  if (!successCooldown && successAudio) {
    setSuccessCooldown(true);
    successAudio.currentTime = 0;
    successAudio.play().catch((error) => {
      console.error("Error al reproducir successSound:", error);
    });

    setTimeout(() => {
      setSuccessCooldown(false);
    }, 500); // Cooldown de 500ms
  }
};
    

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
    const clickSoundInstance = new Audio(clickSound);
    const successSoundInstance = new Audio(successSound);

    clickSoundInstance.preload = "auto";
    successSoundInstance.preload = "auto";

    setClickAudio(clickSoundInstance);
    setSuccessAudio(successSoundInstance);
  }, []);
  
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

  // Sincronizar estados globales con Firebase
  useEffect(() => {
    const globalClickCountRef = ref(database, "clickCount");
    const globalIsPumpingRef = ref(database, "isPumping");
    const candleHeightRef = ref(database, "candleHeight");

    onValue(globalClickCountRef, (snapshot) => {
      setTotalGlobalClicks(snapshot.val() || 0);
    });

    onValue(globalIsPumpingRef, (snapshot) => {
      setGlobalIsPumping(snapshot.val() || false);
    });

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
  
    // Incrementar el contador global de clics
    runTransaction(globalClicksRef, (currentValue) => (currentValue || 0) + 1);
  
    // Incrementar el contador de clics por país
    runTransaction(countryClicksRef, (currentValue) => (currentValue || 0) + 1);
  
    // Incremento de la altura de la vela con dificultad ajustada
    runTransaction(candleHeightRef, (currentHeight) => {
      const baseHeight = currentHeight || window.innerHeight * 0.05;
      const viewportHeight = window.innerHeight;
  
      // Detectar si se ha alcanzado el 55% de la altura máxima
      if (baseHeight / viewportHeight >= 0.55) {
        if (!hasReachedThreshold) {
          // Incrementa el contador de éxitos cuando no ha alcanzado el umbral antes
          setHasReachedThreshold(true);
          incrementSuccesses(); // Llama a la función aquí
        }
        return viewportHeight; // Subida rápida hasta arriba
      }
  
      // Restablece el estado si cae por debajo del umbral
      if (baseHeight / viewportHeight < 0.55) {
        setHasReachedThreshold(false);
      }
  
      // Incremento normal ajustado para dificultad creciente
      const activeUsersFactor = Math.min(totalGlobalClicks / 500, 1.5);
      const increment = Math.max(
        (1 / Math.pow(baseHeight / (viewportHeight * 0.3), 1.5)) * activeUsersFactor,
        0.3 // Incremento mínimo ajustado
      );
  
      // Limitar la altura al tamaño del viewport
      return Math.min(baseHeight + increment, viewportHeight);
    });
  };
  
  

  const handlePress = () => {
    setIsPumping(true);
    setIsAtRest(false);
    set(ref(database, "isPumping"), true);
  
    playClickSound(); // Reproduce el sonido del clic
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

  const incrementSuccesses = () => {
    const globalSuccessRef = ref(database, "successCount");
  
    runTransaction(globalSuccessRef, (currentValue) => (currentValue || 0) + 1).then(() => {
      setIsSuccessActive(true); // Activa la animación del icono
      playSuccessSound(); // Reproduce el sonido del éxito
      
      // Activar la vibración de la luna
      const moonElement = document.querySelector('.moon');
      if (moonElement) {
        moonElement.classList.add('vibrate');
        
        // Eliminar la vibración después de que termine la animación
        setTimeout(() => {
          moonElement.classList.remove('vibrate');
        }, 1200); // Tiempo suficiente para que la animación termine
      }
    });
  };
  
  
  const handleRelease = () => {
    setIsPumping(false);
    set(ref(database, "isPumping"), false);
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
          src={globalIsPumping ? memePump : memeIdle}
          alt="Meme"
          className="meme"
        />
      </div>
  
      {/* Cuadro de PUMPS TOTALES */}
      <div className="total-pumps-counter">
  <span>{formatNumber(totalGlobalClicks)} PUMPS -</span>

  <div className="succes-container">
    <span>-   {formatNumber(totalSuccesses)} SUCCES</span> {/* Nuevo contador */}
    <div
      className={`succes-icon ${isSuccessActive ? "active" : ""}`}
      onAnimationEnd={() => setIsSuccessActive(false)} /* Resetea la animación */
    ></div> {/* Icono circular */}
  </div>
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