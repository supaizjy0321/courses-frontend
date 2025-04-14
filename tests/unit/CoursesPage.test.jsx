import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursesPage from './CoursesPage';

// Mock fetch for API calls
global.fetch = vi.fn();

beforeEach(() => {
  fetch.mockReset();
  
  // Mock successful fetch of courses
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ([
      { 
        id: 1, 
        name: 'Math 101', 
        study_hours: 2.5, 
        assignments: [
          { id: 1, name: 'Homework1', due_date: '2023-12-15' }
        ] 
      }
    ])
  });
});

test('displays courses after fetching data', async () => {
  render(<CoursesPage />);
  
  // Wait for the courses to be loaded
  await waitFor(() => {
    expect(screen.getByText(/Math 101/i)).toBeInTheDocument();
  });
  
  // Check if study hours are displayed
  expect(screen.getByText(/2.5 hours/i)).toBeInTheDocument();
  
  // Check if assignment is displayed
  expect(screen.getByText(/Homework1/i)).toBeInTheDocument();
});

test('allows adding a new course', async () => {
  // Mock the POST request response
  fetch.mockImplementation((url, options) => {
    if (options && options.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 2, name: 'Physics 101', study_hours: 3 })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    });
  });
  
  render(<CoursesPage />);
  
  // Fill out the form
  fireEvent.change(screen.getByPlaceholderText(/Course name/i), {
    target: { value: 'Physics 101' }
  });
  
  fireEvent.change(screen.getByPlaceholderText(/Study hours/i), {
    target: { value: '3' }
  });
  
  // Submit the form
  fireEvent.click(screen.getByText(/Add Course/i));
  
  // Check if the fetch was called with the right data
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('Physics 101')
    }));
  });
});
