import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-section">
      {/* Líneas decorativas superiores */}
      <div className="about-divider">
        <hr className="line-left" />
        <hr className="line-right" />
      </div>

      {/* Contenido principal */}
      <div className="about-content">
        <h2 className="about-title">DVIL THE PUMPERMAN</h2>
        <p className="about-description">
          Deep within the icy abyss of chaos, Fiumbi emerged as the frosty imp
          of fortunes. Mischievous, unpredictable, and utterly captivating,
          Fiumbi is not your ordinary demon. Fueled by the icy winds and clicks
          of daring mortals, this little imp toys with fate and tempts destiny
          with every pump. Legend says that those who aid Fiumbi might just
          unlock unimaginable wealth—or freeze in despair. Will you take the
          gamble and rise to glory?
        </p>
      </div>

      {/* Forma inferior suave */}
      <div className="about-shape-bottom">
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
