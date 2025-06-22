import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import Sidebar from '../dashboard/components/sidebar';

// Use the manual mock
jest.mock('react-router-dom');
const mockNavigate = require('react-router-dom').__mockNavigate;

test('renders sidebar with navigation links', () => {
  render(<Sidebar />);
  
  // Check if sidebar contains expected links
  expect(screen.getByText('TradeHive')).toBeInTheDocument();
  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Add Trade')).toBeInTheDocument();
  expect(screen.getByText('Forum')).toBeInTheDocument();
});

test('logout button calls navigate to home', () => {
  render(<Sidebar />);
  
  // Find and click logout button
  const logoutButton = screen.getByText('Logout');
  fireEvent.click(logoutButton);
  
  // Check if navigate was called with correct path
  expect(mockNavigate).toHaveBeenCalledWith('/');
});
