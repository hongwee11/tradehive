// src/dashboard/Dashboard.test.jsx

// Import necessary testing utilities from React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
// Import @testing-library/jest-dom for extended matchers like toBeInTheDocument
import '@testing-library/jest-dom';

// Import the Dashboard component that we want to test
import Dashboard from './Dashboard';

// --- Mocking Dependencies ---
// Jest's mocking allows us to control the behavior of modules
// that our component depends on, isolating the component for testing.

// Mock Firebase Firestore functions
// We'll provide mock implementations for collection, query, where, getDocs, doc, setDoc
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ // Mock getDocs to return an empty snapshot by default
    forEach: jest.fn(), // Mock forEach to do nothing for an empty snapshot
  })),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()), // Mock setDoc to resolve immediately
}));

// Mock Firebase authentication and database instances
// We'll mock 'db' and 'auth' from '../firebase'
jest.mock('../firebase', () => ({
  db: {}, // Mock db object, not used directly in this component's rendering logic
  auth: {
    currentUser: { // Mock a logged-in user by default
      uid: 'test-user-id',
      displayName: 'Test User',
    },
  },
}));

// Mock child components to prevent their internal logic from affecting Dashboard tests
// This allows us to test if Dashboard *renders* them, without testing their individual behavior.
jest.mock('./components/sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar Mock</div>;
  };
});
jest.mock('./components/chart', () => {
  return function MockChart(props) {
    return <div data-testid="chart-mock">Chart Mock - {props.title}</div>;
  };
});
jest.mock('./components/PositionTable', () => {
  return function MockPositionTable(props) {
    return <div data-testid="position-table-mock">PositionTable Mock</div>;
  };
});
jest.mock('./components/tradehistory', () => {
  return function MockTradeHistory() {
    return <div data-testid="trade-history-mock">TradeHistory Mock</div>;
  };
});

// Mock the global fetch API, as your component makes external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ price: '100.00', values: [] }), // Default mock response for price and time_series
  })
);

// The 'describe' block groups related tests together.
describe('Dashboard Component', () => {

  // Before each test, reset all mocks to their initial state
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure auth.currentUser is set for each test by default
    require('../firebase').auth.currentUser = {
      uid: 'test-user-id',
      displayName: 'Test User',
    };
    // Reset fetch mock to default successful response
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ price: '100.00', values: [] }),
      })
    );
    // Reset getDocs mock to return an empty snapshot by default
    require('firebase/firestore').getDocs.mockImplementation(() => Promise.resolve({
      forEach: jest.fn(),
    }));
  });

  // Test case 1: Check if the loading screen is displayed initially
  test('displays loading message initially', () => {
    render(<Dashboard />);
    // Use getByText to find the loading message
    expect(screen.getByText(/Loading Portfolio Data.../i)).toBeInTheDocument();
  });

  // Test case 2: Check if the main dashboard content renders after loading
  test('renders main dashboard content after data loads', async () => {
    render(<Dashboard />);

    // Wait for the loading message to disappear and main content to appear
    await waitFor(() => {
      expect(screen.queryByText(/Loading Portfolio Data.../i)).not.toBeInTheDocument();
    });

    // Verify the presence of key static text elements from your Dashboard.jsx
    expect(screen.getByText(/Your Portfolio Value:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Gain\/Loss:/i)).toBeInTheDocument();
    expect(screen.getByText(/Day's Change:/i)).toBeInTheDocument();
    expect(screen.getByText(/Realized P&L:/i)).toBeInTheDocument();
    expect(screen.getByText(/PnL Percentage:/i)).toBeInTheDocument();
  });

  // Test case 3: Check if all child components are rendered
  test('renders Sidebar, Chart, TradeHistory, and PositionTable', async () => {
    render(<Dashboard />);

    // Wait for data to load and components to be rendered
    await waitFor(() => {
      expect(screen.queryByText(/Loading Portfolio Data.../i)).not.toBeInTheDocument();
    });

    // Check for the mocked child components using their data-testid attributes
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('chart-mock')).toBeInTheDocument();
    expect(screen.getByTestId('trade-history-mock')).toBeInTheDocument();
    expect(screen.getByTestId('position-table-mock')).toBeInTheDocument();
  });

  // Test case 4: Check initial display of values (e.g., $0.00 when no data)
  test('displays initial zero values for financial metrics', async () => {
    // Ensure getDocs returns no trades for this test
    require('firebase/firestore').getDocs.mockImplementation(() => Promise.resolve({
      forEach: jest.fn(), // No trades means forEach does nothing
    }));
    // Ensure fetch returns default price 0 for calculation
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ price: '0.00', values: [] }),
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading Portfolio Data.../i)).not.toBeInTheDocument();
    });

    // Check for the default $0.00 values
    expect(screen.getByText('Your Portfolio Value: $0.00')).toBeInTheDocument();
    expect(screen.getByText('Total Gain/Loss: $0.00')).toBeInTheDocument();
    expect(screen.getByText('Day\'s Change: $0.00')).toBeInTheDocument();
    expect(screen.getByText('Realized P&L: $0.00')).toBeInTheDocument();
    expect(screen.getByText('PnL Percentage: 0.00%')).toBeInTheDocument();
  });

  // Test case 5: Handles user not logged in gracefully
  test('handles no logged-in user gracefully', async () => {
    // Set currentUser to null to simulate no logged-in user
    require('../firebase').auth.currentUser = null;

    // Spy on console.log to check if the message is logged
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<Dashboard />);

    // Wait for the loading state to resolve (it should resolve quickly if no user)
    await waitFor(() => {
      expect(screen.queryByText(/Loading Portfolio Data.../i)).not.toBeInTheDocument();
    });

    // Assert that the "User not logged in" message was logged
    expect(consoleSpy).toHaveBeenCalledWith("User not logged in. Cannot fetch data.");

    // Assert that the dashboard still renders, but with default values
    expect(screen.getByText('Your Portfolio Value: $0.00')).toBeInTheDocument();

    consoleSpy.mockRestore(); // Restore console.log
  });

});