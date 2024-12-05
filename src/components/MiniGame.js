import React, { useState, useEffect } from "react";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";
import clickSound from "../assets/audio/click-sound.wav";
import successSound from "../assets/audio/success-sound.wav";
import "./MiniGame.css";
import { ref, update, runTransaction } from "firebase/database";
import database from "../firebase/firebaseConfig";

const MiniGame = ({ handlePress, incrementSuccesses, incrementClicks, username, userId }) => {
  const [isPumping, setIsPumping] = useState(false);
  const [candleHeight, setCandleHeight] = useState(window.innerHeight * 0.05);
  const [isAtRest, setIsAtRest] = useState(true);
  const [clickAudio, setClickAudio] = useState(null);
  const [successAudio, setSuccessAudio] = useState(null);
  const [level, setLevel] = useState(1);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5000);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isStreakActive, setIsStreakActive] = useState(false);
  const [canPump, setCanPump] = useState(true);
  const [startTime] = useState(Date.now());
  const [country, setCountry] = useState("Unknown");
  const [lastClickTime, setLastClickTime] = useState(Date.now());
  const [clickSpeedFactor, setClickSpeedFactor] = useState(1);



  const [minHeight, setMinHeight] = useState(window.innerHeight * 0.05);
  const maxHeight = window.innerHeight;

  const levelSuccessThreshold = (level) =>
    minHeight + level * 0.05 * (maxHeight - minHeight);
  useEffect(() => {
    const handleResize = () => {
      setMinHeight(window.innerHeight * 0.05);
    };
  
    window.addEventListener("resize", handleResize);
  
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const clickSoundInstance = new Audio(clickSound);
    const successSoundInstance = new Audio(successSound);

    clickSoundInstance.volume = 0.1;
    successSoundInstance.volume = 1.0;

    setClickAudio(clickSoundInstance);
    setSuccessAudio(successSoundInstance);
  }, []);

  useEffect(() => {
    // Detectar país del usuario
    const fetchCountry = async () => {
      try {
        const response = await fetch("https://ipwhois.app/json/");
        const data = await response.json();
        setCountry(data.country_name || "Unknown");
      } catch (error) {
        console.error("Error obteniendo país:", error);
      }
    };
    fetchCountry();
  }, []);

  const playClickSound = () => {
    if (clickAudio) {
      clickAudio.currentTime = 0;
      clickAudio.play().catch((error) => console.error("Error reproduciendo sonido:", error));
    }
  };

  const playSuccessSound = () => {
    if (successAudio) {
      successAudio.currentTime = 0;
      successAudio.play().catch((error) => console.error("Error reproduciendo sonido:", error));
    }
  };

  const handleCharacterClick = () => {
    if (!canPump) return;
  
    playClickSound();
    incrementClicks(); // Incrementa clics globales.
  
    const now = Date.now();
    const timeBetweenClicks = now - lastClickTime;
    setLastClickTime(now);
    const newSpeedFactor = Math.min(2, Math.max(0.5, 1000 / timeBetweenClicks));
    setClickSpeedFactor(newSpeedFactor);
  
    setTotalClicks((prev) => prev + 1);
    setIsPumping(true);
    setIsAtRest(false);
  
    setCandleHeight((prevHeight) => {
      const successThreshold = levelSuccessThreshold(level);
      const newHeight = Math.min(prevHeight + 15, maxHeight);
  
      if (newHeight >= successThreshold) {
        handleSuccess();
        return maxHeight;
      }
  
      return newHeight;
    });
  
    handleUserPress(); // Actualiza Firebase.
  
    setTimeout(() => setIsPumping(false), 200);
  };
  
  
  const handleUserPress = () => {
    const userRef = ref(database, `users/${username}`);
    runTransaction(userRef, (currentData) => {
      if (!currentData) {
        return {
          totalClicks: 1,
          attempts: 1,
          playTime: Math.floor((Date.now() - startTime) / 1000),
          highestLevel: level + 1,
        };
      }
      return {
        ...currentData,
        highestLevel: Math.max(currentData.highestLevel || 0, level + 1),
        totalClicks: (currentData.totalClicks || 0) + 1,
        playTime: Math.floor((Date.now() - startTime) / 1000),
      };
    });
  };
  
  
  
  const handleSuccess = () => {
    setCanPump(false);
    setIsStreakActive(true);

    setLevel((prevLevel) => {
      const newLevel = prevLevel + 0.5;
      setMultiplier(newLevel);
      return newLevel;
    });

    setTimeLeft(8000 - level * 100);
    incrementSuccesses();
    playSuccessSound();

    setTimeout(() => {
      setCandleHeight(minHeight);
      setTimeout(() => {
        setCanPump(true);
        setIsAtRest(true);
      }, 500);
    }, 500);

    // Guardar en Firebase
    update(ref(database, `users/${userId}`), {
      highestLevel: level + 1,
      totalClicks: totalClicks + 1,
      playTime: Math.floor((Date.now() - startTime) / 1000), // En segundos
      country,
    });
  };

  const getMultiplierStyles = (multiplier) => {
    const size = 3 + multiplier * 0.7; // Tamaño proporcional al multiplicador
    const baseHue = 120; // Base para el color inicial (verde)
    const hueShift = (multiplier * 20) % 360; // Cambia gradualmente en el espectro
    const lightness = 50 + (multiplier % 5) * 5; // Varía el brillo
    const color = `hsl(${baseHue + hueShift}, 80%, ${lightness}%)`; // Colores con tonalidades armónicas
    const glow = `0 0 ${15 + multiplier * 3}px ${color}`;
  
    return {
      fontSize: `${size}rem`,
      color: color,
      textShadow: glow,
      animation: "pulse 1.5s infinite ease-in-out",
    };
  };
  
  

  useEffect(() => {
    if (!isStreakActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const adjustedDecrement = 100 / clickSpeedFactor; // Cuanto más rápido clickeas, menor es el decremento
        if (prev <= 0) {
          setIsStreakActive(false);
          setMultiplier(1);
          setLevel(1);
          return 0;
        }
        return prev - adjustedDecrement;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isStreakActive, clickSpeedFactor]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPumping && candleHeight > minHeight) {
        setCandleHeight((prevHeight) => Math.max(prevHeight - 5, minHeight));
        setIsAtRest(candleHeight <= minHeight);
      }
    }, 100);
  
    return () => clearInterval(interval);
  }, [isPumping, candleHeight, minHeight]);

  return (
    <div className="minigame-container">
      <div
  className={`character-container ${isPumping ? "pumping" : ""}`}
  onClick={handleCharacterClick}
>
  <img
    src={isPumping ? memePump : memeIdle}
    alt="Meme"
    className="character-image"
  />
</div>

      <div
        className={`candle ${isPumping ? "pumping" : ""} ${isAtRest ? "resting" : ""}`}
        style={{ height: `${candleHeight}px`, zIndex: 1 }}
      >
        <div className="wick"></div>
      </div>

      {isStreakActive && (
  <div className="streak-bar">
    <div
         className={`streak-timer ${timeLeft < 2000 ? "warning" : ""}`}
         style={{
        width: `${(timeLeft / (8000 - level * 100)) * 100}%`,
        background: `linear-gradient(to right, red, ${
          timeLeft < 2000 ? "red" : "green"
        })`,
        transition: "background 0.5s linear",
      }}
    ></div>
  </div>
)}


<div
  className={`streak-multiplier ${multiplier > 10 ? "level-high" : ""}`}
  style={getMultiplierStyles(multiplier)}
>
  x{multiplier}</div>
    </div>
  );
};

export default MiniGame;
