import React from "react";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SideBar from './Sidebar';

test('renders navigation links correctly', () => {
  render(
    <MemoryRouter>
      <SideBar />
    </MemoryRouter>
  );
  
  // Check if the Courses link exists
  const coursesLink = screen.getByText(/Courses/i);
  expect(coursesLink).toBeInTheDocument();
  
  // Check if the Calendar link exists
  const calendarLink = screen.getByText(/Calendar/i);
  expect(calendarLink).toBeInTheDocument();
});
