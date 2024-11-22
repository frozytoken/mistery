import React from "react";
import "./AvataresDesktop.css";
import "./AvataresMobile.css";
import ownImage from "../../assets/own.png";
import pfpImage from "../../assets/pfp.png";

const Avatares = () => {
  // Detectar si el dispositivo es móvil
  const isMobileDevice = () => window.innerWidth <= 768;
  const isMobile = isMobileDevice();

  return (
    <div className={`avatares-container-${isMobile ? "mobile" : "desktop"}`}>
      <h1 className={`avatares-title-${isMobile ? "mobile" : "desktop"}`} data-text="Customize Your PFP">
        Customize Your PFP
      </h1>
      <div className={`avatares-options-${isMobile ? "mobile" : "desktop"}`}>
        {/* Opción 1 */}
        <div
          className={`avatares-option-${isMobile ? "mobile" : "desktop"}`}
          onClick={() => console.log("Make Your Own DVIL")}
        >
          <img
            src={ownImage}
            alt="Make Your Own"
            className={`avatares-image-${isMobile ? "mobile" : "desktop"}`}
          />
          <p className={`avatares-text-${isMobile ? "mobile" : "desktop"}`}>Make Your Own DVIL</p>
        </div>
        {/* Divisor "OR" */}
        <div className={`or-divider-${isMobile ? "mobile" : "desktop"}`}>OR</div>
        {/* Opción 2 */}
        <div
          className={`avatares-option-${isMobile ? "mobile" : "desktop"}`}
          onClick={() => console.log("Add DVIL to Your Current PFP")}
        >
          <img
            src={pfpImage}
            alt="Add to Current"
            className={`avatares-image-${isMobile ? "mobile" : "desktop"}`}
          />
          <p className={`avatares-text-${isMobile ? "mobile" : "desktop"}`}>Add DVIL to Your Current PFP</p>
        </div>
      </div>
    </div>
  );
};

export default Avatares;
