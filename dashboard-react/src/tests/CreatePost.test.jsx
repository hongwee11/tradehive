import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  Timestamp: { now: jest.fn() },
}));

jest.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: null },
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock alert
global.alert = jest.fn();

// Import after mocks
const CreatePost = require('../forum/CreatePost').default;

describe('CreatePost', () => {
  test('renders create post form', () => {
    render(<CreatePost />);
    
    expect(screen.getByText('Create a New Post')).toBeInTheDocument();
    expect(screen.getByText('Back to Forum')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(<CreatePost />);
    
    expect(screen.getByLabelText('Post Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Trade Idea')).toBeInTheDocument();
    expect(screen.getByText('Submit Post')).toBeInTheDocument();
  });

  test('updates input values when typing', () => {
    render(<CreatePost />);
    
    const titleInput = screen.getByLabelText('Post Title');
    const contentInput = screen.getByLabelText('Trade Idea');
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    
    expect(titleInput.value).toBe('Test Title');
    expect(contentInput.value).toBe('Test Content');
  });
});