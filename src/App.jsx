import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import CoursesPage from './components/CoursesPage';
import CalendarPage from './components/CalendarPage';

// Define the API URL for Azure
const API_URL = "https://courses-backend-app.azurewebsites.net";

// Main App component
function App() {
  // AppContent component handles the actual content and responds to route changes
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Separate component to use useLocation hook (which must be inside Router)
function AppContent() {
  const [courses, setCourses] = useState([]);
  const location = useLocation();

  // Fetch courses on initial load and when navigating to different routes
  useEffect(() => {
    fetchCourses();
  }, [location.pathname]); // Re-fetch when the route changes

  // Function to fetch courses from the backend
  const fetchCourses = async () => {
    try {
      console.log("Fetching courses from API...");
      const response = await fetch(`${API_URL}/courses`);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Courses fetched successfully:", data);
      
      // Process courses data to ensure assignments is always an array
      const processedData = data.map(course => ({
        ...course,
        assignments: Array.isArray(course.assignments) ? course.assignments : []
      }));
      
      setCourses(processedData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div className="app">
      <SideBar />
      
      <main className="main-content">
        <Routes>
          <Route 
            path="/" 
            element={<CoursesPage courses={courses} setCourses={setCourses} />} 
          />
          <Route 
            path="/calendar" 
            element={<CalendarPage courses={courses} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
