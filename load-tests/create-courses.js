import http from 'k6/http';
import { check, sleep } from 'k6';

// Update this to your actual backend URL
const API_URL = 'https://courses-backend-app.azurewebsites.net';

export const options = {
  vus: 5, // 5 virtual users
  iterations: 10, // Each user performs 10 iterations
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
  },
};

export default function () {
  // Generate a unique course name
  const timestamp = new Date().getTime();
  const courseName = `Load Test Course ${timestamp}`;
  
  // Create a new course
  const payload = JSON.stringify({
    name: courseName,
    course_link: 'https://example.com/load-test',
    study_hours: 2
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const createResponse = http.post(`${API_URL}/courses`, payload, params);
  
  check(createResponse, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'has course id': (r) => r.json().id !== undefined,
  });
  
  // Get the created course ID
  const courseId = createResponse.json().id;
  
  // Now fetch the courses to verify it was added
  const getResponse = http.get(`${API_URL}/courses`);
  
  check(getResponse, {
    'status is 200': (r) => r.status === 200,
    'contains new course': (r) => {
      const courses = r.json();
      return courses.some(course => course.id === courseId);
    },
  });
  
  // Add a small pause between iterations
  sleep(1);
}
