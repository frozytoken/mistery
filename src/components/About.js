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
    <div id="about">
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
          IMPERIO THE PUMPERMAN
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
          At the epicenter of the crypto chaos, IMPERIO has arrived to break all the rules. Forget everything you know about marketing, because we're here to make real noise. We’re not an agency; we’re the iron fist that hits the market. Driven by a mischievous little devil and an insatiable thirst for revolution, IMPERIO isn’t here to play the game—it’s here to change it all.

Your project won’t just be another face in the crowd. We’ll make it loud, we’ll take it where it really matters, because we know the secret is in the people, in the communities we create with soul, not empty promises. At IMPERIO, we don’t wait, we act. We create impact, we build loyalty, and we take your project to the top.

If you’ve got the audacity to take the next step, to stand out among the giants, IMPERIO is the place where everything becomes possible. It’s not just marketing, it’s bringing your idea to life, making it feel real, ensuring there’s no turning back. Here, success isn’t an option—it’s a must.
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
      </div>
    </div>
    </div>
  );
};

export default About;
