// src/components/MePage.jsx
import React from 'react';
import './MePage.css'; // Ensure you import the CSS file
import CorgiVideo from '../assets/Corgi.mp4'; // Adjust the path if necessary

const MePage = () => {
  return (
    <div className="me-page">
      <video autoPlay loop muted className="background-video">
        <source src={CorgiVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">
        <h1>Jingya Zhao</h1>
        <p>This website is for tracking self-learning.</p>
      </div>
    </div>
  );
};

export default MePage;
