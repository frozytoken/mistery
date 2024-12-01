import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is used for navigation
import "./MemeBuilder.css"; // External CSS file for styles
import logo from "../../assets/log1.png";
import twitterIcon from "../../assets/twitter-icon.png";
import telegramIcon from "../../assets/telegram-icon.png";

const MemeBuilder = () => {
  const [, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      navigate("/editor1", { state: { image: URL.createObjectURL(file) } });
    }
  };

  return (
    <div className="meme-builder-container">
      <header className="header-meme">
      <img src={logo} alt="Logo" className="logo" />
  <div className="header-actions-meme">
  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={twitterIcon} alt="Twitter" className="nav-icon" />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                <img src={telegramIcon} alt="Telegram" className="nav-icon" />
              </a>
    <button className="buy-dvil-button-meme">BUY $DVIL</button>
  </div>
</header>

      {/* Main Content */}
      <main
        className="upload-area"
        onClick={() => document.getElementById("imageUploadInput").click()}
      >
        <h1 className="title-meme">DVIL MEME BUILDER</h1>
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
