import React, { useEffect, useState } from "react";
import "./AboutDesktop.css";
import "./AboutMobile.css";

const About = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Define móvil como ≤ 768px
    };

    handleResize(); // Ejecuta en la carga inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={isMobile ? "about-section-mobile" : "about-section-desktop"}>
      {/* Líneas decorativas superiores */}
      <div
        className={
          isMobile ? "about-divider-mobile" : "about-divider-desktop"
        }
      >
        <hr
          className={isMobile ? "line-left-mobile" : "line-left-desktop"}
        />
        <h2
          className={isMobile ? "about-title-mobile" : "about-title-desktop"}
        >
          DVIL THE PUMPERMAN
        </h2>
        <hr
          className={isMobile ? "line-right-mobile" : "line-right-desktop"}
        />
      </div>

      {/* Contenido principal */}
      <div
        className={
          isMobile ? "about-content-mobile" : "about-content-desktop"
        }
      >
        <p
          className={
            isMobile
              ? "about-description-mobile"
              : "about-description-desktop"
          }
        >
          Deep within the chaotic heart of the market, DVIL the Pumperman has
          descended to unleash a storm of unpredictable gains and electrifying
          excitement. Born from the whispers of traders, DVIL doesn’t play
          nice—he pumps the market to oblivion. With devilish charm and a hunger
          for chaos, DVIL thrives on your ambition and audacity. Will you rise
          to glory or be left in the dust? DVIL never waits.
        </p>
      </div>

      {/* Forma inferior suave */}
      <div
        className={
          isMobile
            ? "about-shape-bottom-mobile"
            : "about-shape-bottom-desktop"
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#gradient)"
            d="M0,256L80,234.7C160,213,320,171,480,144C640,117,800,107,960,128C1120,149,1280,203,1360,229.3L1440,256L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
          ></path>
          <defs>
            <linearGradient id="gradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default About;
