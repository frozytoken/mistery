import React from "react";
import "./AddDvilToPfpDesktop.css";
import "./AddDvilToPfpMobile.css";

const AddDvilToPfp = () => {
  // Detectar si el dispositivo es móvil
  const isMobileDevice = () => window.innerWidth <= 768;
  const isMobile = isMobileDevice();

  return (
    <div className={`add-dvil-container-${isMobile ? "mobile" : "desktop"}`}>
      <h1
        className={`add-dvil-title-${isMobile ? "mobile" : "desktop"}`}
      >
        Add DVIL to Your Current PFP
      </h1>
      <p
        className={`add-dvil-description-${isMobile ? "mobile" : "desktop"}`}
      >
        Agrega un toque DVIL a tu avatar existente.
      </p>
      {/* Aquí irá la lógica para agregar DVIL a un PFP existente */}
    </div>
  );
};

export default AddDvilToPfp;
