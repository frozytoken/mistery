import React, { useState, memo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice, faSync, faDownload } from "@fortawesome/free-solid-svg-icons";
import "./AvatarGeneratorDesktop.css";
import backImage from "../../assets/backpfp.png";

const categories = {
  background: ["blue.png", "beach.jpg", "blue2.png", "blueyellow.png", "green.png"],
  tshirt: ["bonesbody.png", "flankensteinbody.png", "mummybody.png", "pumpkinbody.png"],
  mouth: ["2teethmouth.png", "happymouth.png", "lipmouth.png", "meowmouth.png"],
  hair: ["afrohair.png", "bluehair.png", "relaxhair.png"],
  headcomplements: ["afrohead.png", "brainhead.png", "explosionhead.png"],
  eyes: ["eye1.png", "eye2.png", "eye3.png", "eye4.png"],
  accesories: ["aposit.png", "goldearrings.png", "piercingsilverright.png"],
  glasses: ["3dglasses.png", "monoculo.png", "glasses6.png"],
};

const AvatarGenerator = () => {
  const [selectedItems, setSelectedItems] = useState({
    background: 0,
    tshirt: null,
    mouth: null,
    hair: null,
    headcomplements: null,
    eyes: null,
    accesories: null,
    glasses: null,
  });

  const avatarRef = useRef();

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
      headcomplements: null,
      eyes: null,
      accesories: null,
      glasses: null,
    });
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");

    const drawLayer = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve();
        };
      });
    };

    const drawAvatar = async () => {
      await drawLayer(getImagePath("background", selectedItems.background));
      await drawLayer(`${process.env.PUBLIC_URL}/assets/avatares/body/bodyblue.png`);

      for (const [category, index] of Object.entries(selectedItems)) {
        if (index !== null && category !== "background") {
          await drawLayer(getImagePath(category, index));
        }
      }

      const link = document.createElement("a");
      link.download = "avatar.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    drawAvatar();
  };

  return (
    <div
      className="avatar-generator"
      style={{
        "--background-image": `url(${backImage})`,
      }}
    >
      <header className="generator-header">
        <h1 className="generator-title">DVIL PFP</h1>
      </header>

      <main className="generator-main">
        {/* Avatar Preview */}
        <div className="avatar-preview-container" ref={avatarRef}>
          <div className="avatar-display">
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
          <p className="avatar-code">B1-B1-E1</p>
        </div>

        {/* Controls */}
        <div className="generator-controls">
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

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="randomize-button" onClick={handleRandomize}>
              <FontAwesomeIcon icon={faDice} /> Randomize
            </button>
            <button className="reset-button" onClick={handleReset}>
              <FontAwesomeIcon icon={faSync} /> Reset traits
            </button>
            <button className="download-button" onClick={handleDownload}>
              <FontAwesomeIcon icon={faDownload} /> Download
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default memo(AvatarGenerator);
