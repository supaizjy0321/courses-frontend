import React, { useState, useEffect } from "react";

// Define the Azure backend API URL - used for all fetch calls
// Change this value when deploying to different environments
const API_URL = "https://courses-backend-app.azurewebsites.net";

const CoursesPage = ({ courses = [], setCourses }) => {
  // State for form inputs
  const [courseName, setCourseName] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [editingCourseIndex, setEditingCourseIndex] = useState(null);
  const [assignmentInputs, setAssignmentInputs] = useState({});
  // Add state to track minimized courses
  const [minimizedCourses, setMinimizedCourses] = useState({});

  // Fetch courses from the API when the component mounts
  // This is only called once when the component is first rendered
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses from API...");
        // Use API_URL constant instead of hardcoded localhost
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched courses:", data);
        
        // Ensure assignments property is always an array
        const processedData = data.map(course => ({
          ...course,
          assignments: Array.isArray(course.assignments) ? course.assignments : []
        }));
        
        setCourses(processedData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [setCourses]);

  // Helper function to manage assignment form inputs
  const handleAssignmentInputChange = (courseId, field, value) => {
    setAssignmentInputs(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        [field]: value
      }
    }));
  };

  // Create a new course
  const addCourse = async () => {
    if (courseName && courseLink) {
      const newCourse = { 
        name: courseName, 
        course_link: courseLink, 
        study_hours: 0,
        assignments: []
      };
      try {
        // POST request to create a new course
        const response = await fetch(`${API_URL}/courses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCourse),
        });
        
        if (response.ok) {
          const createdCourse = await response.json();
          setCourses(prevCourses => [...prevCourses, {
            ...createdCourse,
            assignments: []
          }]);
          resetCourseInputs();
        }
      } catch (error) {
        console.error('Error adding course:', error);
      }
    }
  };

  // Delete a course and its assignments
  const deleteCourse = async (index) => {
    const courseId = courses[index]?.id;
    if (courseId) {
      try {
        // DELETE request to remove a course
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Update local state after successful deletion
          setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
          // Clean up assignment inputs for deleted course
          const newAssignmentInputs = { ...assignmentInputs };
          delete newAssignmentInputs[courseId];
          setAssignmentInputs(newAssignmentInputs);
          // Remove from minimized courses if present
          const newMinimizedCourses = { ...minimizedCourses };
          delete newMinimizedCourses[courseId];
          setMinimizedCourses(newMinimizedCourses);
        } else {
          console.error('Error deleting course:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  // Update an existing course
  const editCourse = async (index) => {
    const updatedCourse = {
      ...courses[index],
      name: courseName || courses[index].name,
      course_link: courseLink || courses[index].course_link,
    };
    try {
      // PUT request to update a course
      const response = await fetch(`${API_URL}/courses/${updatedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });
      if (response.ok) {
        const updatedCourseData = await response.json();
        // Update local state with the response from the server
        const updatedCourses = [...courses];
        updatedCourses[index] = {
          ...updatedCourseData,
          assignments: courses[index].assignments
        };
        setCourses(updatedCourses);
        setEditingCourseIndex(null);
        resetCourseInputs();
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  // Update the study hours for a course
  const changeStudyHours = async (index, increment) => {
    const updatedCourses = [...courses];
    const updatedCourse = { ...updatedCourses[index] };
    updatedCourse.study_hours += increment;
    
    // Ensure study hours don't go below zero
    if (updatedCourse.study_hours < 0) {
      updatedCourse.study_hours = 0;
    }

    try {
      // PUT request to update study hours
      const response = await fetch(`${API_URL}/courses/${updatedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });

      if (response.ok) {
        const responseData = await response.json();
        updatedCourses[index] = {
          ...responseData,
          assignments: updatedCourse.assignments
        };
        setCourses(updatedCourses);
      } else {
        const errorData = await response.json();
        console.error("Error updating study hours:", errorData);
      }
    } catch (error) {
      console.error("Network error when updating study hours:", error);
    }
  };

  // Add a new assignment to a course
  const addAssignment = async (courseIndex) => {
    const course = courses[courseIndex];
    const courseInputs = assignmentInputs[course.id] || {};
    const assignmentName = courseInputs.name;
    const dueDate = courseInputs.dueDate;
    
    if (assignmentName && dueDate) {
      console.log("Adding assignment:", assignmentName, "for course:", course.name);
      
      const newAssignment = { 
        name: assignmentName, 
        due_date: dueDate, 
        is_completed: false,
        course_id: course.id
      };
      
      try {
        // POST request to create a new assignment
        const response = await fetch(`${API_URL}/courses/${course.id}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAssignment),
        });
        
        if (response.ok) {
          const createdAssignment = await response.json();
          // Update local state with the new assignment
          const updatedCourses = [...courses];
          const updatedCourse = { ...updatedCourses[courseIndex] };
          
          if (!updatedCourse.assignments) {
            updatedCourse.assignments = [];
          }
          
          updatedCourse.assignments.push(createdAssignment);
          updatedCourses[courseIndex] = updatedCourse;
          setCourses(updatedCourses);
          
          // Reset form inputs after successful creation
          handleAssignmentInputChange(course.id, 'name', '');
          handleAssignmentInputChange(course.id, 'dueDate', '');
        } else {
          const errorData = await response.json();
          console.error("Error from server:", errorData);
        }
      } catch (error) {
        console.error('Error adding assignment:', error);
      }
    } else {
      console.warn("Missing required assignment fields:", { name: assignmentName, dueDate });
    }
  };

  // Delete an assignment
  const deleteAssignment = async (courseIndex, assignmentIndex, event) => {
    event.stopPropagation(); // Prevent event bubbling to parent elements
    
    const course = courses[courseIndex];
    const assignment = course.assignments[assignmentIndex];
    
    if (assignment && assignment.id) {
      try {
        // DELETE request to remove an assignment
        const response = await fetch(`${API_URL}/assignments/${assignment.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Update local state after successful deletion
          const updatedCourses = [...courses];
          const updatedCourse = { ...updatedCourses[courseIndex] };
          const updatedAssignments = [...updatedCourse.assignments];
          
          updatedAssignments.splice(assignmentIndex, 1);
          updatedCourse.assignments = updatedAssignments;
          updatedCourses[courseIndex] = updatedCourse;
          
          setCourses(updatedCourses);
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  // Toggle the completion status of an assignment
  const toggleAssignmentCompletion = async (courseIndex, assignmentIndex) => {
    const course = courses[courseIndex];
    const assignment = course.assignments[assignmentIndex];
    
    if (assignment) {
      // Update local state optimistically
      const updatedCourses = [...courses];
      const updatedCourse = { ...updatedCourses[courseIndex] };
      const updatedAssignments = [...updatedCourse.assignments];
      const updatedAssignment = { ...updatedAssignments[assignmentIndex] };
      
      updatedAssignment.is_completed = !updatedAssignment.is_completed;
      updatedAssignments[assignmentIndex] = updatedAssignment;
      updatedCourse.assignments = updatedAssignments;
      updatedCourses[courseIndex] = updatedCourse;
      
      setCourses(updatedCourses);
      
      try {
        // PUT request to update assignment completion status
        await fetch(`${API_URL}/assignments/${assignment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_completed: updatedAssignment.is_completed }),
        });
        
        // Store a timestamp in localStorage to notify other components of the update
        // This helps with cross-component synchronization
        localStorage.setItem('assignment_updated', Date.now().toString());
      } catch (error) {
        // Revert the local state change if the API call fails
        console.error('Error updating assignment:', error);
        updatedAssignment.is_completed = !updatedAssignment.is_completed;
        setCourses([...updatedCourses]);
      }
    }
  };

  // Reset form inputs for adding/editing courses
  const resetCourseInputs = () => {
    setCourseName("");
    setCourseLink("");
  };

  // Toggle course card minimized state
  const toggleCourseMinimized = (courseId) => {
    setMinimizedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Render the component UI
  return (
    <div className="courses-page">
      <h1>{editingCourseIndex !== null ? "Update Course" : "Add Course"}</h1>
      
      {/* Course form for adding/editing courses */}
      <div>
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Course Link"
          value={courseLink}
          onChange={(e) => setCourseLink(e.target.value)}
        />
        <button onClick={editingCourseIndex !== null ? () => editCourse(editingCourseIndex) : addCourse}>
          {editingCourseIndex !== null ? "Update Course" : "Add Course"}
        </button>
        {editingCourseIndex !== null && (
          <button onClick={() => {
            setEditingCourseIndex(null);
            resetCourseInputs();
          }}>
            Cancel
          </button>
        )}
      </div>

      {/* Display course list */}
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <div key={course.id || index} className="course" style={{ 
            margin: "20px 0", 
            padding: "15px", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px" 
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "10px"
            }}>
              <h3>{course.name}</h3>
              {/* Minimize/Expand button */}
              <button 
                onClick={() => toggleCourseMinimized(course.id)}
                style={{
                  background: "none",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                {minimizedCourses[course.id] ? "Expand" : "Minimize"}
              </button>
            </div>

            {/* Course details - only show if not minimized */}
            {!minimizedCourses[course.id] && (
              <>
                <p>Link: <a href={course.course_link} target="_blank" rel="noopener noreferrer">{course.course_link}</a></p>

                {/* Course actions */}
                <div style={{ marginBottom: "10px" }}>
                  <button 
                    onClick={() => { 
                      setEditingCourseIndex(index); 
                      setCourseName(course.name); 
                      setCourseLink(course.course_link); 
                    }}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteCourse(index)}>Delete</button>
                </div>

                {/* Study hours control */}
                <div style={{ margin: "15px 0" }}>
                  <p>Total Study Hours: {course.study_hours || 0}</p>
                  <button onClick={() => changeStudyHours(index, 0.5)} style={{ marginRight: "5px" }}>+</button>
                  <button onClick={() => changeStudyHours(index, -0.5)}>-</button>
                </div>

                {/* Assignment form */}
                <div style={{ 
                  margin: "15px 0", 
                  padding: "10px", 
                  backgroundColor: "#f5f5f5", 
                  borderRadius: "5px" 
                }}>
                  <h4>Add New Assignment</h4>
                  <input
                    type="text"
                    placeholder="Assignment Name"
                    value={(assignmentInputs[course.id] || {}).name || ''}
                    onChange={(e) => handleAssignmentInputChange(course.id, 'name', e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                  <input
                    type="date"
                    value={(assignmentInputs[course.id] || {}).dueDate || ''}
                    onChange={(e) => handleAssignmentInputChange(course.id, 'dueDate', e.target.value)}
                    style={{ marginRight: "10px", padding: "5px" }}
                  />
                  <button onClick={() => addAssignment(index)}>Add Assignment</button>
                </div>

                {/* Assignment list */}
                <div className="assignments-list">
                  <h4>Assignments:</h4>
                  {Array.isArray(course.assignments) && course.assignments.length > 0 ? (
                    course.assignments.map((assignment, idx) => (
                      assignment && (
                        <div key={`assignment-${assignment.id || idx}`} className="assignment" style={{
                          backgroundColor: assignment.is_completed ? "#f0f8ff" : "#fff",
                          borderLeft: assignment.is_completed ? "3px solid #4CAF50" : "3px solid #f44336",
                          marginBottom: "8px"
                        }}>
                          <div 
                            className="assignment-content"
                            style={{ 
                              textDecoration: assignment.is_completed ? "line-through" : "none",
                              padding: "8px",
                              margin: "5px 0",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            {/* Assignment information and checkbox */}
                            <div onClick={() => toggleAssignmentCompletion(index, idx)} style={{ cursor: "pointer", flex: 1 }}>
                              <input 
                                type="checkbox" 
                                checked={assignment.is_completed} 
                                onChange={() => toggleAssignmentCompletion(index, idx)}
                                style={{ marginRight: "8px" }}
                              />
                              <span style={{ fontWeight: "bold" }}>{assignment.name}</span>
                              <span style={{ marginLeft: "10px", color: "#666" }}>
                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                              </span>
                            </div>
                            {/* Delete assignment button */}
                            <button 
                              className="delete-assignment-btn"
                              onClick={(e) => deleteAssignment(index, idx, e)}
                              style={{ 
                                marginLeft: "10px", 
                                background: "#ff6b6b", 
                                color: "white", 
                                border: "none",
                                borderRadius: "4px",
                                padding: "5px 10px",
                                cursor: "pointer"
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    ))
                  ) : (
                    <p>No assignments yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
};

export default CoursesPage;
