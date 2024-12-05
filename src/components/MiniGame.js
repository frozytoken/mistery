import React, { useState, useEffect } from "react";
import memeIdle from "../assets/meme_idle.png";
import memePump from "../assets/meme_pump.png";
import clickSound from "../assets/audio/click-sound.wav";
import successSound from "../assets/audio/success-sound.wav";
import "./MiniGame.css";

const MiniGame = ({ handlePress, incrementSuccesses }) => {
  const [isPumping, setIsPumping] = useState(false);
  const [candleHeight, setCandleHeight] = useState(window.innerHeight * 0.05);
  const [isAtRest, setIsAtRest] = useState(true);
  const [clickAudio, setClickAudio] = useState(null);
  const [successAudio, setSuccessAudio] = useState(null);
  const [level, setLevel] = useState(1); // Nivel inicial
  const [multiplier, setMultiplier] = useState(1); // Multiplicador inicial
  const [timeLeft, setTimeLeft] = useState(5000); // Tiempo restante por nivel
  const [isStreakActive, setIsStreakActive] = useState(false);
  const [canPump, setCanPump] = useState(true);

  const minHeight = window.innerHeight * 0.05;
  const maxHeight = window.innerHeight;

  const levelSuccessThreshold = (level) =>
    minHeight + level * 0.1 * (maxHeight - minHeight); // Incremento proporcional por nivel

  // Inicializar audios
  useEffect(() => {
    const clickSoundInstance = new Audio(clickSound);
    const successSoundInstance = new Audio(successSound);

    clickSoundInstance.volume = 0.1;
    successSoundInstance.volume = 1.0;

    setClickAudio(clickSoundInstance);
    setSuccessAudio(successSoundInstance);
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
    handlePress();

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

    setTimeout(() => setIsPumping(false), 200);
  };

  const handleSuccess = () => {
    setCanPump(false);
    setIsStreakActive(true);

    // Incrementa el nivel y sincroniza el multiplicador
    setLevel((prevLevel) => {
      const newLevel = prevLevel + 1;
      setMultiplier(newLevel); // Sincroniza el multiplicador con el nivel exacto
      return newLevel;
    });

    setTimeLeft(5000 - level * 300); // Reduce tiempo en cada nivel
    incrementSuccesses();
    playSuccessSound();

    // Resetea la vela y permite seguir bombeando
    setTimeout(() => {
      setCandleHeight(minHeight);
      setTimeout(() => {
        setCanPump(true);
        setIsAtRest(true);
      }, 500);
    }, 500);
  };

  useEffect(() => {
    if (!isStreakActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setIsStreakActive(false);
          setMultiplier(1); // Reinicia el multiplicador a x1
          setLevel(1); // Reinicia el nivel
          return 0;
        }
        return prev - 100; // Reduce gradualmente
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isStreakActive]);

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
      {/* Contenedor del personaje */}
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

      {/* Vela */}
      <div
        className={`candle ${isPumping ? "pumping" : ""} ${isAtRest ? "resting" : ""}`}
        style={{ height: `${candleHeight}px`, zIndex: 1 }}
      >
        <div className="wick"></div>
      </div>

      {/* Barra de rachas */}
      {isStreakActive && (
        <div className="streak-bar">
          <div
            className="streak-timer"
            style={{ width: `${(timeLeft / (5000 - level * 300)) * 100}%` }}
          ></div>
        </div>
      )}

      {/* Multiplicador */}
      <div className="streak-multiplier">x{multiplier}</div>
    </div>
  );
};

export default MiniGame;
