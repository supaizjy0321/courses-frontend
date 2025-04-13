import React, { useState, useEffect } from "react";

// Add this constant at the top of your file
const API_URL = "https://courses-backend-app.azurewebsites.net";

const CoursesPage = ({ courses = [], setCourses }) => {
  const [courseName, setCourseName] = useState("");
  const [courseLink, setCourseLink] = useState("");
  const [editingCourseIndex, setEditingCourseIndex] = useState(null);
  const [assignmentInputs, setAssignmentInputs] = useState({});

  // Fetch courses when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log("Fetching courses...");
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Fetched courses:", data);
        
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

  const handleAssignmentInputChange = (courseId, field, value) => {
    setAssignmentInputs(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        [field]: value
      }
    }));
  };

  const addCourse = async () => {
    if (courseName && courseLink) {
      const newCourse = { 
        name: courseName, 
        course_link: courseLink, 
        study_hours: 0,
        assignments: []
      };
      try {
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

  const deleteCourse = async (index) => {
    const courseId = courses[index]?.id;
    if (courseId) {
      try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
          const newAssignmentInputs = { ...assignmentInputs };
          delete newAssignmentInputs[courseId];
          setAssignmentInputs(newAssignmentInputs);
        } else {
          console.error('Error deleting course:', await response.text());
        }
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const editCourse = async (index) => {
    const updatedCourse = {
      ...courses[index],
      name: courseName || courses[index].name,
      course_link: courseLink || courses[index].course_link,
    };
    try {
      const response = await fetch(`${API_URL}/courses/${updatedCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCourse),
      });
      if (response.ok) {
        const updatedCourseData = await response.json();
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

  const changeStudyHours = async (index, increment) => {
    const updatedCourses = [...courses];
    const updatedCourse = { ...updatedCourses[index] };
    updatedCourse.study_hours += increment;
    
    if (updatedCourse.study_hours < 0) {
      updatedCourse.study_hours = 0;
    }

    try {
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

  // Add an assignment
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
        const response = await fetch(`${API_URL}/courses/${course.id}/assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newAssignment),
        });
        
        if (response.ok) {
          const createdAssignment = await response.json();
          const updatedCourses = [...courses];
          const updatedCourse = { ...updatedCourses[courseIndex] };
          
          if (!updatedCourse.assignments) {
            updatedCourse.assignments = [];
          }
          
          updatedCourse.assignments.push(createdAssignment);
          updatedCourses[courseIndex] = updatedCourse;
          setCourses(updatedCourses);
          
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

  const deleteAssignment = async (courseIndex, assignmentIndex, event) => {
    event.stopPropagation();
    
    const course = courses[courseIndex];
    const assignment = course.assignments[assignmentIndex];
    
    if (assignment && assignment.id) {
      try {
        const response = await fetch(`${API_URL}/assignments/${assignment.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
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

  const toggleAssignmentCompletion = async (courseIndex, assignmentIndex) => {
    const course = courses[courseIndex];
    const assignment = course.assignments[assignmentIndex];
    
    if (assignment) {
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
        await fetch(`${API_URL}/assignments/${assignment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_completed: updatedAssignment.is_completed }),
        });
        
        // Add this line to store a timestamp in local storage when an assignment status changes
        localStorage.setItem('assignment_updated', Date.now().toString());
      } catch (error) {
        console.error('Error updating assignment:', error);
        updatedAssignment.is_completed = !updatedAssignment.is_completed;
        setCourses([...updatedCourses]);
      }
    }
  };

  const resetCourseInputs = () => {
    setCourseName("");
    setCourseLink("");
  };

  return (
    <div className="courses-page">
      <h1>{editingCourseIndex !== null ? "Update Course" : "Add Course"}</h1>
      
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

      {courses.length > 0 ? (
        courses.map((course, index) => (
          <div key={course.id || index} className="course" style={{ 
            margin: "20px 0", 
            padding: "15px", 
            border: "1px solid #e0e0e0", 
            borderRadius: "8px" 
          }}>
            <h3>{course.name}</h3>
            <p>Link: <a href={course.course_link} target="_blank" rel="noopener noreferrer">{course.course_link}</a></p>

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

            <div style={{ margin: "15px 0" }}>
              <p>Total Study Hours: {course.study_hours || 0}</p>
              <button onClick={() => changeStudyHours(index, 0.5)} style={{ marginRight: "5px" }}>+</button>
              <button onClick={() => changeStudyHours(index, -0.5)}>-</button>
            </div>

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
          </div>
        ))
      ) : (
        <p>No courses available.</p>
      )}
    </div>
  );
};

export default CoursesPage;
