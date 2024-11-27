import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is used for navigation
import "./MemeBuilder.css"; // External CSS file for styles

const MemeBuilder = () => {
  const [, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      navigate("/editor", { state: { image: URL.createObjectURL(file) } });
    }
  };

  return (
    <div className="meme-builder-container">
      <main
        className="upload-area"
        onClick={() => document.getElementById("imageUploadInput").click()}
      >
        <h1 className="title">DVIL MEME BUILDER</h1>
        <p className="subtitle">CLICK TO UPLOAD AN IMAGE AND START EDITING</p>
        <input
          id="imageUploadInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </main>
    </div>
  );
};

export default MemeBuilder;
