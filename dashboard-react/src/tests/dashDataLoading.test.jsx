import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../dashboard/dashboard';

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } }
}));

// Fix the Firestore mock structure - SUPPORT BOTH forEach AND docs.map
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    // For Dashboard component (uses forEach)
    forEach: jest.fn((callback) => {
      callback({
        data: () => ({
          ticker: 'AAPL',
          action: 'BUY', 
          quantity: 10,
          price: 150,
          date: { toDate: () => new Date('2025-06-20') }
        })
      });
    }),
    // For TradeHistory component (uses docs.map)
    docs: [{
      id: 'trade1',
      data: () => ({
        ticker: 'AAPL',
        action: 'BUY',
        quantity: 10,
        price: 150,
        date: { toDate: () => new Date('2025-06-20') }
      })
    }],
    empty: false
  }))
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div>Mocked Chart</div>
}));

// Mock the Chart component directly if it's imported
jest.mock('../dashboard/components/chart', () => {
  return function MockChart() {
    return <div>Portfolio Value Over Time Chart</div>;
  };
});

// Use manual mock
jest.mock('react-router-dom');

test('dashboard loads and displays portfolio data', async () => {
  render(<Dashboard />);
  
  // Should show loading initially
  expect(screen.getByText(/Loading Portfolio Data/i)).toBeInTheDocument();
  
  // Wait for data to load (increase timeout if needed)
  await waitFor(() => {
    expect(screen.getByText(/Your Portfolio Value/i)).toBeInTheDocument();
  }, { timeout: 3000 });

  // Check if TradeHistory component is rendered
  expect(screen.getByText(/Recent Trades/i)).toBeInTheDocument();
});