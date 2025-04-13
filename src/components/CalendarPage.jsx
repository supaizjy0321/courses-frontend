// src/components/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarPage.css';
import RainbowIcon from '../assets/rainbow.svg';
import SunIcon from '../assets/sun.svg';

// Add API URL constant
const API_URL = "https://courses-backend-app.azurewebsites.net";

const CalendarPage = ({ courses = [] }) => {
  const [date, setDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [selectedDateAssignments, setSelectedDateAssignments] = useState([]);
  
  // Debug log for courses prop
  useEffect(() => {
    console.log("Courses received in CalendarPage:", courses);
  }, [courses]);

  // Extract assignments from courses
  useEffect(() => {
    if (courses && Array.isArray(courses)) {
      const allAssignments = courses.flatMap(course => 
        course.assignments && Array.isArray(course.assignments) 
          ? course.assignments.map(assignment => {
              // Parse the date but ensure it doesn't shift due to timezone
              const dueDate = assignment.due_date;
              return {
                id: assignment.id,
                name: assignment.name,
                dueDate: dueDate, // Use the original due_date string directly
                isCompleted: assignment.is_completed,
                courseName: course.name,
                courseId: course.id
              };
            })
          : []
      );
      console.log("All assignments processed:", allAssignments); // Debug log
      setAssignments(allAssignments);
    }
  }, [courses]);

  // Listen for assignment updates from other components
  useEffect(() => {
    // Function to check for updates and refresh data
    const checkForUpdates = () => {
      fetchLatestData();
    };

    // Set up interval to check for updates
    const intervalId = setInterval(checkForUpdates, 2000); // Check every 2 seconds
    
    // Set up storage event listener for immediate updates
    const handleStorageChange = (e) => {
      if (e.key === 'assignment_updated') {
        console.log('Assignment update detected, refreshing data');
        fetchLatestData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up on component unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array so this only runs once on mount

  // Function to fetch latest data
  const fetchLatestData = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const freshData = await response.json();
      
      // Process the fresh data
      const refreshedAssignments = freshData.flatMap(course => 
        course.assignments && Array.isArray(course.assignments) 
          ? course.assignments.map(assignment => {
              const dueDate = assignment.due_date;
              return {
                id: assignment.id,
                name: assignment.name,
                dueDate: dueDate,
                isCompleted: assignment.is_completed,
                courseName: course.name,
                courseId: course.id
              };
            })
          : []
      );
      
      // Compare if data has changed
      const currentAssignmentsJSON = JSON.stringify(assignments);
      const newAssignmentsJSON = JSON.stringify(refreshedAssignments);
      
      if (currentAssignmentsJSON !== newAssignmentsJSON) {
        console.log('Assignments data changed, updating calendar');
        setAssignments(refreshedAssignments);
      }
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Update selected date assignments when date changes
  useEffect(() => {
    // Format the selected date as YYYY-MM-DD (same format as in the database)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("Selected date formatted:", formattedDate); // Debug log for the selected date
    
    const assignmentsForDate = assignments.filter(assignment => {
      return assignment.dueDate === formattedDate;
    });
    
    console.log("Assignments for selected date:", assignmentsForDate); // Debug log
    setSelectedDateAssignments(assignmentsForDate);
  }, [date, assignments]);

  // Function to determine tile class name based on assignments
  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    // Format the tile date as YYYY-MM-DD (same format as in the database)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Compare by date components, not timestamp
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
    
    // If this is today's date
    if (isToday) {
      return 'today-tile';
    }
    
    const dateAssignments = assignments.filter(assignment => assignment.dueDate === formattedDate);
    
    if (dateAssignments.length === 0) return null;
    
    if (dateAssignments.every(assignment => assignment.isCompleted)) {
      return 'completed-assignment-day';
    } else {
      return 'assignment-day';
    }
  };

  // Function to add content to calendar tiles
  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    // Format the tile date as YYYY-MM-DD (same format as in the database)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Compare by date components, not timestamp
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
    
    // If this is today's date, use the sun icon
    if (isToday) {
      return (
        <div className="today-icon-container">
          <img src={SunIcon} alt="Today" className="today-icon" />
        </div>
      );
    }
    
    const dateAssignments = assignments.filter(assignment => assignment.dueDate === formattedDate);
    
    if (dateAssignments.length === 0) return null;

    if (dateAssignments.every(assignment => assignment.isCompleted)) {
      return <img src={RainbowIcon} alt="Completed" className="tile-icon" />;
    } else {
      return <div className="assignment-indicator"></div>;
    }
  };

  // Force refresh to fetch latest data
  const forceRefresh = async () => {
    await fetchLatestData();
    console.log("Manual refresh completed");
  };

  return (
    <div className="page calendar-page">
      {/* Add background container */}
      <div className="calendar-background" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("../assets/color.jpg")', // Optional: you can add a background image here
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
      }}></div>
      
      {/* Calendar content with margin for sidebar */}
      <div className="calendar-content" style={{
        position: 'relative',
        marginLeft: '100px', /* Adjust to match sidebar width */
        zIndex: 1,
      }}>
        <h1>Calendar</h1>
        <button onClick={forceRefresh} className="refresh-button">Refresh Data</button>
        <div className="debug-info">
          <p>Total Assignments: {assignments.length}</p>
          <p>Selected Date: {date.toDateString()}</p>
        </div>
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
            tileClassName={getTileClassName}
            tileContent={getTileContent}
          />
        </div>
        <div className="assignments-panel">
          <h2>Assignments Due on {date.toDateString()}:</h2>
          {selectedDateAssignments.length > 0 ? (
            <ul className="assignment-list">
              {selectedDateAssignments.map((assignment, index) => (
                <li 
                  key={index} 
                  className={assignment.isCompleted ? 'completed-assignment' : 'pending-assignment'}
                >
                  <strong>{assignment.courseName}</strong>: {assignment.name}
                  {assignment.isCompleted && <img src={RainbowIcon} alt="Completed" className="rainbow-icon" />}
                </li>
              ))}
            </ul>
          ) : (
            <p>No assignments due on this date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
