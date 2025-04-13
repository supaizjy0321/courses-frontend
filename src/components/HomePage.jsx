// src/components/HomePage.jsx
import React, { useEffect } from 'react';

const HomePage = () => {
  useEffect(() => {
    // Make sure Spline loads after DOM is mounted
    const container = document.getElementById('spline-container');

    if (!container.querySelector('spline-viewer')) {
      const spline = document.createElement('spline-viewer');
      spline.setAttribute('url', 'https://prod.spline.design/UBSbbB4xkLJdgKnK/scene.splinecode');
      spline.style.width = '100%';
      spline.style.height = '100%';
      spline.style.position = 'absolute';
      spline.style.top = '0';
      spline.style.left = '0';
      spline.style.zIndex = '-1'; // make it background
      container.appendChild(spline);
    }
  }, []);

  return (
    <div id="spline-container" className="relative w-full h-screen overflow-hidden">
      <div className="page home-page relative z-10 text-yellow p-8">
        <h1 className="text-4xl font-bold">Mission: Destroy Tasks</h1>
        <p className="mt-4 text-lg">This is my website for tracking self-learning.</p>
      </div>
    </div>
  );
  
};

export default HomePage;
