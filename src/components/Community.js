import React, { useState } from "react";
import "./Community.css";

const Community = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="community" className="community-section">
      {/* Título de la sección */}
      <div className="community-title-container">
        <hr className="line-left" />
        <h2 className="community-title">Our Community</h2>
        <hr className="line-right" />
      </div>

      {/* Contenido principal */}
      <div className="community-content-container">
        {/* Logros */}
        <div className="community-item">
          <h3 className="community-item-title">Achievements</h3>
          <p className="community-item-text">
            We’ve achieved milestones that prove the strength of a united community. Our members lead the charge for change.
          </p>
        </div>

        {/* Cómo trabajamos */}
        <div className="community-item">
          <h3 className="community-item-title">How We Work</h3>
          <p className="community-item-text">
            We operate with the boldness of innovators, taking risks where others hesitate. Our methodology is as disruptive as our goals.
          </p>
        </div>

        {/* Quiénes somos */}
        <div className="community-item">
          <h3 className="community-item-title">Who We Are</h3>
          <p className="community-item-text">
            We are a team driven by passion, creativity, and a desire to break the mold. Our mission is to revolutionize the space.
          </p>
        </div>

        {/* Partners */}
        <div className="community-item">
          <h3 className="community-item-title">Our Partners</h3>
          <p className="community-item-text">
            We are proud to work with trailblazing partners who share our vision and dedication to bringing meaningful change.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          <div className="faq-item" onClick={() => toggleFAQ(0)}>
            <div className="faq-question">
              <h4>What is IMPERIO?</h4>
              <span className={activeIndex === 0 ? "faq-icon rotated" : "faq-icon"}>+</span>
            </div>
            {activeIndex === 0 && <p className="faq-answer">IMPERIO is a marketing and community-driven movement in the crypto space, focused on shaking up the market.</p>}
          </div>
          <div className="faq-item" onClick={() => toggleFAQ(1)}>
            <div className="faq-question">
              <h4>How do we get involved?</h4>
              <span className={activeIndex === 1 ? "faq-icon rotated" : "faq-icon"}>+</span>
            </div>
            {activeIndex === 1 && <p className="faq-answer">You can get involved by joining our community, following our updates, and participating in our initiatives.</p>}
          </div>
          <div className="faq-item" onClick={() => toggleFAQ(2)}>
            <div className="faq-question">
              <h4>How can I become a partner?</h4>
              <span className={activeIndex === 2 ? "faq-icon rotated" : "faq-icon"}>+</span>
            </div>
            {activeIndex === 2 && <p className="faq-answer">If you're interested in partnering with us, get in touch via our contact page, and let's start a conversation.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
