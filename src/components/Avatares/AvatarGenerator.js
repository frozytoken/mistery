import React, { useState, useEffect, memo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faSync, faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames"; // Manejo dinámico de clases
import "./AvatarGeneratorDesktop.css";
import "./AvatarGeneratorMobile.css"; // CSS específico para móvil
import backImage from "../../assets/backpfp.png";
import html2canvas from "html2canvas";

const categories = {
  background: ["blue.png", "beach.jpg", "blue2.png", "blueyellow.png", "green.png"],
  tshirt: ["bonesbody.png", "flankensteinbody.png", "mummybody.png", "pumpkinbody.png"],
  mouth: ["2teethmouth.png", "happymouth.png", "lipmouth.png", "meowmouth.png"],
  hair: ["afrohair.png", "bluehair.png", "relaxhair.png"],
  complements: ["afrohead.png", "brainhead.png", "explosionhead.png"],
  eyes: ["eye1.png", "eye2.png", "eye3.png", "eye4.png"],
  accesories: ["aposit.png", "goldearrings.png", "piercingsilverright.png"],
  glasses: ["3dglasses.png", "monoculo.png", "glasses6.png"],
};

const AvatarGenerator = () => {
  const [isMobile, setIsMobile] = useState(false); // Detecta si estamos en móvil
  const [selectedItems, setSelectedItems] = useState({
    background: 0,
    tshirt: null,
    mouth: null,
    hair: null,
    complements: null,
    eyes: null,
    accesories: null,
    glasses: null,
  });
  const [customText, setCustomText] = useState("Type Here");

  const avatarRef = useRef();
  const avatarDisplayRef = useRef();

  // Detectar si estamos en móvil o escritorio
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Móvil si el ancho es <= 768px
    };

    handleResize(); // Verificamos al cargar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize); // Limpiamos el evento
  }, []);

  const getImagePath = (category, index) =>
    `${process.env.PUBLIC_URL}/assets/avatares/${category}/${categories[category][index]}`;

  const handleNavigate = (category, direction) => {
    setSelectedItems((prev) => {
      const currentIndex = prev[category] || 0;
      const nextIndex =
        direction === "left"
          ? (currentIndex - 1 + categories[category].length) % categories[category].length
          : (currentIndex + 1) % categories[category].length;

      return { ...prev, [category]: nextIndex };
    });
  };

  const handleRandomize = () => {
    const newItems = {};
    Object.keys(categories).forEach((cat) => {
      const randomIndex = Math.floor(Math.random() * categories[cat].length);
      newItems[cat] = randomIndex;
    });
    setSelectedItems(newItems);
  };

  const handleReset = () => {
    setSelectedItems({
      background: 0,
      tshirt: null,
      mouth: null,
      hair: null,
      complements: null,
      eyes: null,
      accesories: null,
      glasses: null,
    });
    setCustomText("$IMP. #ThePumperMan");
  };

  const handleDownload = (includeCustomText) => {
    const ref = includeCustomText ? avatarRef.current : avatarDisplayRef.current;
    html2canvas(ref, {
      useCORS: true,
      scale: 5,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = includeCustomText ? "full-avatar.png" : "inner-avatar.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div
      className={classNames("avatar-generator", {
        mobile: isMobile,
        desktop: !isMobile,
      })} // Aplicamos clases dinámicas según el dispositivo
      style={{
        "--background-image": `url(${backImage})`,
      }}
    >
      <header className="generator-header">
        <button className="back-button" onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h1 className="generator-title">CREATE YOUR OWN IMP PFP</h1>
      </header>

      <main className="generator-main">
        <div className="avatar-preview-container" ref={avatarRef}>
          <div className="avatar-display" ref={avatarDisplayRef}>
            <img
              src={getImagePath("background", selectedItems.background)}
              alt="background"
              className="avatar-layer background"
            />
            <img
              src={`${process.env.PUBLIC_URL}/assets/avatares/body/bodyblue.png`}
              alt="body"
              className="avatar-layer body"
            />
            {Object.entries(selectedItems).map(([category, index]) =>
              index !== null && category !== "background" ? (
                <img
                  key={category}
                  src={getImagePath(category, index)}
                  alt={category}
                  className={`avatar-layer ${category}`}
                />
              ) : null
            )}
          </div>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="avatar-code-input"
            placeholder="Enter custom text"
          />
        </div>

        <div className="generator-controls">
          <div className="control-section">
            {Object.keys(categories).map((category) => (
              <div key={category} className="control-group">
                <button
                  className="control-button"
                  onClick={() => handleNavigate(category, "left")}
                >
                  {"<"}
                </button>
                <span className="control-label">{category}</span>
                <button
                  className="control-button"
                  onClick={() => handleNavigate(category, "right")}
                >
                  {">"}
                </button>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            <button className="randomize-button" onClick={handleRandomize}>
              <FontAwesomeIcon icon={faDice} /> Randomize
            </button>
            <button className="reset-button" onClick={handleReset}>
              <FontAwesomeIcon icon={faSync} /> Reset traits
            </button>
            <div className="download-buttons">
              <button className="download-button" onClick={() => handleDownload(true)}>
                <FontAwesomeIcon icon={faDownload} /> Full Avatar
              </button>
              <button className="download-button" onClick={() => handleDownload(false)}>
                <FontAwesomeIcon icon={faDownload} /> Inner Avatar
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default memo(AvatarGenerator);
