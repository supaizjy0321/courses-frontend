// Example Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout" style={{ display: 'flex', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1, margin: 0, padding: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;