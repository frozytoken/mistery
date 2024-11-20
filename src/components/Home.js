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
  const [bubbleCooldown, setBubbleCooldown] = useState(false);

  // Frases específicas de Frozy
  const phrases = [
    "Keep clicking, you broke loser! This is your shot!",
    "Boom! Millionaire vibes incoming!",
    "Don’t stop now, we’re printing money!",
    "Higher! Faster! Get rich or die clicking!",
    "Let’s break records and wallets, baby!",
    "Is that all you’ve got? Click like you mean it!",
    "You wanna be poor forever? Keep clicking!",
    "Damn, this is addictive! Don’t slow down!",
    "Another click, another dollar in the bag!",
    "Who’s gonna stop us? Not these paper hands!",
    "We’re in the lead, baby! Stay on top!",
    "Nothing can stop this degenerate train!",
    "Push the limits! Break the damn system!",
    "Is this the top? Hell no, keep going!",
    "Click harder, you weakling! Faster!",
    "We’re smashing the leaderboard, let’s go!",
    "One step closer to the moon!",
    "Nobody can touch us, let’s show them!",
    "We own the damn sky, keep clicking!",
    "That’s it? Pathetic. Click more!",
    "Click, click, click! Don’t be a coward!",
    "We’re unstoppable! Show them who’s boss!",
    "Hell yeah, that’s how you do it!",
    "Wow, this pace is insane! Keep it up!",
    "Another click? Damn right, don’t stop!",
    "The sky’s not the limit, we break through!",
    "Breaking records left and right, baby!",
    "Faster! Are you even trying?",
    "This is f***ing epic, keep smashing!",
    "Click like you’re printing cash!",
    "Wanna be broke? Stop clicking. Wanna be rich? Keep going!"
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

    if (!bubbleCooldown) {
      // Elegir frase aleatoria y mostrarla como burbuja
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setBubbles((prev) => [...prev, { id: Date.now(), text: phrase }]);
      setBubbleCooldown(true);

      // Cooldown de 3 segundos
      setTimeout(() => {
        setBubbleCooldown(false);
      }, 4000);
    }

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
            zIndex: 1,
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
