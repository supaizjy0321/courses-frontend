import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import CoursesPage from './components/CoursesPage';
import CalendarPage from './components/CalendarPage';
import MePage from './components/MePage';
import './index.css';
import ErrorBoundary from "./components/ErrorBoundary";

// Define the API URL for Azure
const API_URL = "https://courses-backend-app.azurewebsites.net";

// Create a wrapper component to handle route changes
const AppContent = () => {
  const [courses, setCourses] = useState([]);
  const location = useLocation();
  
  // Function to fetch courses data
  const fetchCourses = async () => {
    try {
      // Use the API_URL instead of localhost
      const response = await fetch(`${API_URL}/courses`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      console.log("Courses fetched in App.js:", data);
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses in App.js:', error);
    }
  };

  // Fetch courses when the app loads
  useEffect(() => {
    fetchCourses();
  }, []);
  
  // Re-fetch courses when navigating to the calendar page
  useEffect(() => {
    if (location.pathname === '/calendar') {
      console.log('Navigated to calendar, refreshing courses data');
      fetchCourses();
    }
  }, [location.pathname]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage courses={courses} setCourses={setCourses} />} />
          <Route path="/calendar" element={<CalendarPage courses={courses} />} />
          <Route path="/me" element={<MePage />} />
        </Routes>
      </div>
    </div>
  );
};

// Main App component with Router
const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
