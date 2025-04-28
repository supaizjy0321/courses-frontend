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
        <p>I am a third-year student at Centria UAS, specializing in Information Technology.</p>
        <p>This is my first full-stack website, designed to help users manage their learning activities effectively.</p>
        <p>I aim to continuously improve this application by adding new features and enhancing the user experience based on feedback.</p>
      </div>
    </div>
  );
};

export default MePage;
