import http from 'k6/http';
import { check, sleep } from 'k6';

// Update this to your actual backend URL
const API_URL = 'https://courses-backend-app.azurewebsites.net';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  // Test GET /courses endpoint
  const coursesResponse = http.get(`${API_URL}/courses`);
  
  check(coursesResponse, {
    'status is 200': (r) => r.status === 200,
    'response has courses': (r) => r.json().length > 0,
  });
  
  // Test GET /assignments endpoint
  const assignmentsResponse = http.get(`${API_URL}/assignments`);
  
  check(assignmentsResponse, {
    'status is 200': (r) => r.status === 200,
    'response has assignments': (r) => r.json().length > 0,
  });
  
  // Pause before next iteration
  sleep(1);
}
