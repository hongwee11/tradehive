import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectionsPage from '../projection/projection';

// Mock Sidebar
jest.mock('../dashboard/components/sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar Mock</div>;
  };
});

// Mock Chart component
jest.mock('../dashboard/components/chart', () => {
  return function MockChart(props) {
    return <div data-testid="chart-mock">Chart: {props.title}</div>;
  };
});

describe('ProjectionsPage Component', () => {
  test('renders all input fields correctly', () => {
    render(<ProjectionsPage />);
    
    expect(screen.getByText('Stock Projections')).toBeInTheDocument();
    expect(screen.getByText('Current Data')).toBeInTheDocument();
    expect(screen.getByText('Assumptions')).toBeInTheDocument();
    expect(screen.getByText('5-Year Projection')).toBeInTheDocument();
    expect(screen.getByText('Calculation Results')).toBeInTheDocument();
  });

  test('renders input fields with correct labels', () => {
    render(<ProjectionsPage />);
    
    expect(screen.getByText('EPS (TTM)')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('EPS Growth Rate')).toBeInTheDocument();
    expect(screen.getByText('Appropriate EPS Multiple')).toBeInTheDocument();
    expect(screen.getByText('Desired Return')).toBeInTheDocument();
  });

  test('percentage inputs display % symbol', () => {
    render(<ProjectionsPage />);
    
    const percentageSymbols = screen.getAllByText('%');
    expect(percentageSymbols).toHaveLength(2); // EPS Growth Rate and Desired Return
  });

  test('calculation results display default values', () => {
    render(<ProjectionsPage />);
    
    expect(screen.getByText(/Return from today's price/)).toBeInTheDocument();
    expect(screen.getByText(/Entry Price for 15% Return/)).toBeInTheDocument();
    expect(screen.getByText(/5-Year Target Price/)).toBeInTheDocument();
    expect(screen.getByText(/Future EPS \(5Y\)/)).toBeInTheDocument();
  });

  test('desired return defaults to 15% when empty', () => {
    render(<ProjectionsPage />);
    
    expect(screen.getByText('Entry Price for 15% Return')).toBeInTheDocument();
  });

  test('updates desired return display when changed', async () => {
    render(<ProjectionsPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter desired return'), { target: { value: '20' } });
    
    await waitFor(() => {
      expect(screen.getByText('Entry Price for 20% Return')).toBeInTheDocument();
    });
  });

  test('renders sidebar component', () => {
    render(<ProjectionsPage />);
    
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });
});