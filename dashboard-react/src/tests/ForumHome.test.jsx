import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For toBeInTheDocument()

// Mock Firebase Firestore functions (getDocs and collection)
// These are named exports from 'firebase/firestore'
import { collection, getDocs } from 'firebase/firestore'; //

// Mock the 'firebase/firestore' module itself to control its functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), // Mock the collection function
  getDocs: jest.fn(),    // Mock the getDocs function
}));

// Mock your local firebase.js file's 'db' export
jest.mock('../firebase', () => ({
  db: {}, // Mock 'db' as an empty object
}));


jest.doMock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  MemoryRouter: ({ children }) => <div>{children}</div>, // Ensure MemoryRouter is mocked
}));

// After setting up the doMock, explicitly require MemoryRouter for use in the test file
// We do this to ensure MemoryRouter comes from our mock.
const { MemoryRouter } = require('react-router-dom'); //

// Import the component under test *after* all mocks are set up
const ForumHome = require('../forum/ForumHome').default; // Correct path based on your structure


describe('ForumHome Component', () => {
  // Define mock data for posts, mirroring the structure from your screenshot
  const mockPosts = [
    { id: '1', title: 'trade trade trade', author: 'hello@gmail.com' },
    { id: '2', title: 'testing', author: 'Anonymous' },
    { id: '3', title: 'test', author: 'jeromepulo0@gmail.com' },
    { id: '4', title: 'Test Post', author: 'potato2@gmail.com' },
    { id: '5', title: 'hi', author: 'Anonymous' },
  ];

  // This runs before each test to set up our mocks cleanly
  beforeEach(() => {
    jest.clearAllMocks(); // Clears any previous mock calls and implementations

    // Configure the mocked getDocs function to return our mock posts
    getDocs.mockResolvedValue({
      docs: mockPosts.map(post => ({
        id: post.id,
        data: () => post, // Simulates Firebase's doc.data() method
      })),
    });
  });

  // Test 1: Renders the main headings and navigation links
  test('renders the main headings and navigation links', () => {
    render(
      <MemoryRouter> {/* MemoryRouter is now correctly from our mock */}
        <ForumHome />
      </MemoryRouter>
    );

    // Assert the presence of static elements from the UI
    expect(screen.getByText('Trade Ideas Forum')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
    expect(screen.getByText('+ Create a Post')).toBeInTheDocument();
  });

  // Test 2: Fetches and displays forum posts correctly
  test('fetches and displays forum posts correctly', async () => {
    render(
      <MemoryRouter>
        <ForumHome />
      </MemoryRouter>
    );

    // Use waitFor to wait for the asynchronous data fetching and rendering of posts
    await waitFor(() => {
      // Assert that each mock post's title is displayed
      expect(screen.getByText('trade trade trade')).toBeInTheDocument();
      expect(screen.getByText('testing')).toBeInTheDocument();
      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('hi')).toBeInTheDocument();

      // Assert that each mock post's author is displayed
      expect(screen.getByText('by hello@gmail.com')).toBeInTheDocument();
      const anonymousAuthors = screen.getAllByText('by Anonymous');
      expect(anonymousAuthors.length).toBe(2);
      expect(screen.getByText('by jeromepulo0@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('by potato2@gmail.com')).toBeInTheDocument();
    });

    // Verify that the Firebase Firestore functions were called as expected
    expect(getDocs).toHaveBeenCalledTimes(1);
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'posts');
  });

  // Test 3: Post links navigate to the correct detail pages
  test('post links navigate to the correct detail pages', async () => {
    render(
      <MemoryRouter>
        <ForumHome />
      </MemoryRouter>
    );

    // Wait for posts to be rendered before checking their links
    await waitFor(() => {
      const post1Link = screen.getByText('trade trade trade').closest('a');
      expect(post1Link).toHaveAttribute('href', '/forum/post/1');

      const post2Link = screen.getByText('testing').closest('a');
      expect(post2Link).toHaveAttribute('href', '/forum/post/2');
    });
  });
});