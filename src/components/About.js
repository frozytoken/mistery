import React from 'react';
import './About.css';
import { Fade } from 'react-awesome-reveal';

const About = () => {
  return (
    <Fade>
      <div className="about-container">
        <h2 className="about-title">Why Frost?</h2>
        <p className="about-description">
          Frosted memes bring innovation, fun, and exclusivity to Solana.
        </p>
      </div>
    </Fade>
  );
};


export default About;
