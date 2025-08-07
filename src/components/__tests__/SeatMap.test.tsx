import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SeatMap from '../SeatMap';
import bookingReducer from '../../store/slices/bookingSlice';
import { type Seat } from '../../types';

// Mock seat data for testing
const mockSeats: Seat[] = [
  {
    id: '1',
    row: 'A',
    number: 1,
    isAvailable: true,
    isSelected: false,
    type: 'regular',
    price: 12.99,
    showtimeId: 'showtime-1',
  },
  {
    id: '2',
    row: 'A',
    number: 2,
    isAvailable: true,
    isSelected: false,
    type: 'premium',
    price: 18.99,
    showtimeId: 'showtime-1',
  },
  {
    id: '3',
    row: 'A',
    number: 3,
    isAvailable: false,
    isSelected: false,
    type: 'regular',
    price: 12.99,
    showtimeId: 'showtime-1',
  },
  {
    id: '4',
    row: 'B',
    number: 1,
    isAvailable: true,
    isSelected: false,
    type: 'vip',
    price: 22.99,
    showtimeId: 'showtime-1',
  },
  {
    id: '5',
    row: 'B',
    number: 2,
    isAvailable: true,
    isSelected: false,
    type: 'regular',
    price: 12.99,
    showtimeId: 'showtime-1',
  },
];

// Create test store with initial state
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      booking: bookingReducer,
    },
    preloadedState: {
      booking: {
        selectedMovie: null,
        selectedShowtime: null,
        selectedSeats: [],
        totalPrice: 0,
        ...initialState,
      },
    },
  });
};

// Helper function to render component with Redux store
const renderWithStore = (store: ReturnType<typeof createTestStore>, seats: Seat[] = mockSeats) => {
  return render(
    <Provider store={store}>
      <SeatMap seats={seats} />
    </Provider>
  );
};

describe('SeatMap', () => {
  it('renders screen indicator', () => {
    const store = createTestStore();
    renderWithStore(store);

    expect(screen.getByText('SCREEN')).toBeInTheDocument();
  });

  it('renders all seats in correct rows', () => {
    const store = createTestStore();
    renderWithStore(store);

    // Check row labels
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();

    // Check seat numbers - use getAllByRole since we have multiple seats with same numbers
    const seat1Buttons = screen.getAllByRole('button', { name: '1' });
    const seat2Buttons = screen.getAllByRole('button', { name: '2' });
    const seat3Buttons = screen.getAllByRole('button', { name: '3' });

    // Should have 2 seats with number 1 (A1, B1), 2 with number 2 (A2, B2), and 1 with number 3 (A3)
    expect(seat1Buttons).toHaveLength(2);
    expect(seat2Buttons).toHaveLength(2);
    expect(seat3Buttons).toHaveLength(1);
  });

  it('renders legend with all seat types and prices', () => {
    const store = createTestStore();
    renderWithStore(store);

    expect(screen.getByText('Regular ($12.99)')).toBeInTheDocument();
    expect(screen.getByText('Premium ($18.99)')).toBeInTheDocument();
    expect(screen.getByText('VIP ($22.99)')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('disables unavailable seats', () => {
    const store = createTestStore();
    renderWithStore(store);

    const unavailableSeat = screen.getAllByRole('button', { name: '3' })[0];
    expect(unavailableSeat).toBeDisabled();
  });

  it('enables available seats', () => {
    const store = createTestStore();
    renderWithStore(store);

    const availableSeat = screen.getAllByRole('button', { name: '1' })[0];
    expect(availableSeat).not.toBeDisabled();
  });

  it('selects seat when clicked', () => {
    const store = createTestStore();
    renderWithStore(store);

    const seatButton = screen.getAllByRole('button', { name: '1' })[0];
    
    // Initially no seats selected
    expect(store.getState().booking.selectedSeats).toHaveLength(0);

    // Click seat
    fireEvent.click(seatButton);

    // Check that seat is selected in store
    const selectedSeats = store.getState().booking.selectedSeats;
    expect(selectedSeats).toHaveLength(1);
    expect(selectedSeats[0].id).toBe('1');
    expect(selectedSeats[0].row).toBe('A');
    expect(selectedSeats[0].number).toBe(1);
  });

  it('deselects seat when clicked again', () => {
    const store = createTestStore();
    renderWithStore(store);

    const seatButton = screen.getAllByRole('button', { name: '1' })[0];
    
    // Click seat to select
    fireEvent.click(seatButton);
    expect(store.getState().booking.selectedSeats).toHaveLength(1);

    // Click seat again to deselect
    fireEvent.click(seatButton);
    expect(store.getState().booking.selectedSeats).toHaveLength(0);
  });

  it('allows multiple seat selection', () => {
    const store = createTestStore();
    renderWithStore(store);

    const seat1 = screen.getAllByRole('button', { name: '1' })[0];
    const seat2 = screen.getAllByRole('button', { name: '2' })[0];
    
    // Select first seat
    fireEvent.click(seat1);
    expect(store.getState().booking.selectedSeats).toHaveLength(1);

    // Select second seat
    fireEvent.click(seat2);
    expect(store.getState().booking.selectedSeats).toHaveLength(2);

    const selectedSeats = store.getState().booking.selectedSeats;
    expect(selectedSeats.map(s => s.id)).toContain('1');
    expect(selectedSeats.map(s => s.id)).toContain('2');
  });

  it('does not select unavailable seats when clicked', () => {
    const store = createTestStore();
    renderWithStore(store);

    const unavailableSeat = screen.getAllByRole('button', { name: '3' })[0];
    
    // Try to click unavailable seat
    fireEvent.click(unavailableSeat);

    // Should remain unselected
    expect(store.getState().booking.selectedSeats).toHaveLength(0);
  });

  it('displays seat tooltips with correct information', () => {
    const store = createTestStore();
    renderWithStore(store);

    const regularSeat = screen.getAllByRole('button', { name: '1' })[0];
    const premiumSeat = screen.getAllByRole('button', { name: '2' })[0];
    const vipSeat = screen.getAllByRole('button', { name: /1/ })[1]; // B1 seat

    expect(regularSeat).toHaveAttribute('title', 'A1 - regular - $12.99');
    expect(premiumSeat).toHaveAttribute('title', 'A2 - premium - $18.99');
    expect(vipSeat).toHaveAttribute('title', 'B1 - vip - $22.99');
  });

  it('renders with pre-selected seats', () => {
    const preSelectedSeat = mockSeats[0];
    const store = createTestStore({
      selectedSeats: [{ ...preSelectedSeat, isSelected: true }],
    });
    renderWithStore(store);

    // The selected seat should be in the store
    expect(store.getState().booking.selectedSeats).toHaveLength(1);
    expect(store.getState().booking.selectedSeats[0].id).toBe('1');
  });

  it('handles empty seat array', () => {
    const store = createTestStore();
    renderWithStore(store, []);

    // Should still render screen and legend
    expect(screen.getByText('SCREEN')).toBeInTheDocument();
    expect(screen.getByText('Regular ($12.99)')).toBeInTheDocument();
    
    // But no seat buttons should be present
    expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument();
  });

  it('groups seats correctly by row', () => {
    const store = createTestStore();
    renderWithStore(store);

    // Check that row A has 3 seats and row B has 2 seats
    const rowAElement = screen.getByText('A').parentElement;
    const rowBElement = screen.getByText('B').parentElement;

    // Count buttons in each row (excluding the row label)
    const rowAButtons = rowAElement?.querySelectorAll('button') || [];
    const rowBButtons = rowBElement?.querySelectorAll('button') || [];

    expect(rowAButtons).toHaveLength(3);
    expect(rowBButtons).toHaveLength(2);
  });

  it('applies correct CSS classes for different seat types', () => {
    const store = createTestStore();
    renderWithStore(store);

    const regularSeat = screen.getAllByRole('button', { name: '1' })[0];
    const premiumSeat = screen.getAllByRole('button', { name: '2' })[0];
    const unavailableSeat = screen.getAllByRole('button', { name: '3' })[0];
    
    // Regular seat should have green colors
    expect(regularSeat).toHaveClass('bg-green-200');
    
    // Premium seat should have yellow colors  
    expect(premiumSeat).toHaveClass('bg-yellow-200');
    
    // Unavailable seat should have gray colors
    expect(unavailableSeat).toHaveClass('bg-gray-400');
  });

  it('updates seat selection when toggling multiple times', () => {
    const store = createTestStore();
    renderWithStore(store);

    const seatButton = screen.getAllByRole('button', { name: '1' })[0];
    
    // Multiple select/deselect cycles
    fireEvent.click(seatButton); // select
    expect(store.getState().booking.selectedSeats).toHaveLength(1);
    
    fireEvent.click(seatButton); // deselect
    expect(store.getState().booking.selectedSeats).toHaveLength(0);
    
    fireEvent.click(seatButton); // select again
    expect(store.getState().booking.selectedSeats).toHaveLength(1);
  });

  it('preserves seat data integrity when selecting', () => {
    const store = createTestStore();
    renderWithStore(store);

    const seatButton = screen.getAllByRole('button', { name: '2' })[0]; // Premium seat
    fireEvent.click(seatButton);

    const selectedSeat = store.getState().booking.selectedSeats[0];
    expect(selectedSeat).toEqual({
      id: '2',
      row: 'A',
      number: 2,
      isAvailable: true,
      isSelected: true,
      type: 'premium',
      price: 18.99,
      showtimeId: 'showtime-1',
    });
  });
});
