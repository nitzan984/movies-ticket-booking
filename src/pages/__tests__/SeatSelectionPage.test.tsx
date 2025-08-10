import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import SeatSelectionPage from '../SeatSelectionPage';
import moviesReducer from '../../store/slices/moviesSlice';
import seatsReducer from '../../store/slices/seatsSlice';
import bookingReducer from '../../store/slices/bookingSlice';
import { type Movie, type Showtime, type Seat } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock useNavigate
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

// Mock data
const mockMovie: Movie = {
  id: 'movie-1',
  title: 'Test Movie',
  description: 'A great test movie',
  duration: 120,
  genre: ['Action', 'Adventure'],
  rating: 'PG-13',
  poster: 'test-poster.jpg',
  releaseDate: '2025-08-01',
};

const mockShowtime: Showtime = {
  id: 'showtime-1',
  movieId: 'movie-1',
  theaterId: 'theater-1',
  startTime: '2025-08-15T19:00:00Z',
  endTime: '2025-08-15T21:00:00Z',
  price: 15.99,
  seatsPerRow: 10,
  rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  availableSeats: 80,
  totalSeats: 80,
};

const mockSeats: Seat[] = [
  {
    id: 'showtime-1-A1',
    row: 'A',
    number: 1,
    isAvailable: true,
    isSelected: false,
    type: 'premium',
    price: 18.99,
    showtimeId: 'showtime-1',
  },
  {
    id: 'showtime-1-A2',
    row: 'A',
    number: 2,
    isAvailable: true,
    isSelected: false,
    type: 'premium',
    price: 18.99,
    showtimeId: 'showtime-1',
  },
  {
    id: 'showtime-1-B1',
    row: 'B',
    number: 1,
    isAvailable: false,
    isSelected: false,
    type: 'regular',
    price: 12.99,
    showtimeId: 'showtime-1',
  },
];

// Helper function to create test store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      movies: moviesReducer,
      seats: seatsReducer,
      booking: bookingReducer,
    },
    preloadedState,
  });
};

// Helper function to render component with all providers
const renderWithProviders = (
  component: React.ReactElement,
  {
    preloadedState = {},
    route = '/movie/movie-1/showtime/showtime-1/seats',
  } = {}
) => {
  const store = createTestStore(preloadedState);
  
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('SeatSelectionPage', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockNavigate.mockClear();
    
    // Default mock return value for useParams
    mockUseParams.mockReturnValue({ showtimeId: 'showtime-1' });
    
    // Mock window.alert
    window.alert = jest.fn();
    
    // Reset all mocks to avoid interference between tests
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    it('shows loading state when seats are loading', () => {
      const initialState = {
        seats: { seatsByShowtime: {}, loading: true, error: null, currentShowtimeId: null },
        booking: { selectedMovie: null, selectedShowtime: null, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      expect(screen.getByText('Loading seats...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error state when there is an error loading seats', () => {
      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: 'Failed to load seats', currentShowtimeId: null },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      expect(screen.getByText('Error Loading Seats')).toBeInTheDocument();
      expect(screen.getByText('Failed to load seats')).toBeInTheDocument();
      expect(screen.getByText('Back to Movies')).toBeInTheDocument();
    });

    it('shows no seats found state when seats array is empty', () => {
      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      expect(screen.getByText('No Seats Found')).toBeInTheDocument();
      expect(screen.getByText('No seat data available for this showtime or an error occurred.')).toBeInTheDocument();
    });

    it('navigates back when Back to Movies button is clicked in error state', () => {
      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: 'Test error', currentShowtimeId: null },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      const backButton = screen.getByText('Back to Movies');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Data Fetching', () => {
    it('fetches missing movie and showtime data when not in state', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockShowtime,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMovie,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSeats,
        } as Response);

      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: null, currentShowtimeId: null },
        booking: { selectedMovie: null, selectedShowtime: null, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      // Wait for data loading to complete
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(3);
      }, { timeout: 3000 });
    });

    it('handles fetch errors and navigates to home', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: null, currentShowtimeId: null },
        booking: { selectedMovie: null, selectedShowtime: null, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });

    it('handles showtime not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: null, currentShowtimeId: null },
        booking: { selectedMovie: null, selectedShowtime: null, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      }, { timeout: 3000 });
    });
  });

  describe('Component Rendering', () => {
    it('renders seat selection page with movie and showtime data', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Select Your Seats')).toBeInTheDocument();
      });

      expect(screen.getAllByText('Test Movie')[0]).toBeInTheDocument();
      expect(screen.getByText('Booking Summary')).toBeInTheDocument();
      expect(screen.getByText('Back to Showtimes')).toBeInTheDocument();
    });

    it('displays formatted date and time', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        // Look for any date/time related text that might be rendered
        const timeElements = screen.queryAllByText(/PM|AM/i);
        const dateElements = screen.queryAllByText(/Aug|August/i);
        
        // At least one of these should be present if the component renders date/time
        expect(timeElements.length > 0 || dateElements.length > 0).toBe(true);
      });
    });

    it('renders seat map component', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        // Check for seat elements or row indicators
        const seatElements = screen.queryAllByText('1');
        expect(seatElements.length).toBeGreaterThan(0);
      });

      // Check if seat numbers are rendered
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back when Back to Showtimes button is clicked', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Back to Showtimes')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Showtimes');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Seat Selection', () => {
    it('shows proceed button as disabled when no seats are selected', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Proceed to Booking')).toBeInTheDocument();
      });

      const proceedButton = screen.getByText('Proceed to Booking');
      expect(proceedButton).toBeDisabled();
    });

    it('shows selected seats in booking summary', async () => {
      const selectedSeats = [mockSeats[0]];
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { 
          selectedMovie: mockMovie, 
          selectedShowtime: mockShowtime, 
          selectedSeats: selectedSeats, 
          totalPrice: 18.99 
        },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Selected Seats')).toBeInTheDocument();
      });

      expect(screen.getByText(/A1.*premium/)).toBeInTheDocument();
      expect(screen.getByText('Total (1 seats)')).toBeInTheDocument();
    });

    it('shows clear selection button when seats are selected', async () => {
      const selectedSeats = [mockSeats[0]];
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { 
          selectedMovie: mockMovie, 
          selectedShowtime: mockShowtime, 
          selectedSeats: selectedSeats, 
          totalPrice: 18.99 
        },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Clear Selection')).toBeInTheDocument();
        expect(screen.getByText('Proceed to Booking')).toBeEnabled();
      });
    });

    it('calculates total price correctly with multiple seats', async () => {
      const selectedSeats = [mockSeats[0], mockSeats[1]];
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { 
          selectedMovie: mockMovie, 
          selectedShowtime: mockShowtime, 
          selectedSeats: selectedSeats, 
          totalPrice: 37.98 
        },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Total (2 seats)')).toBeInTheDocument();
        expect(screen.getByText('$37.98')).toBeInTheDocument();
      });
    });
  });

  describe('Booking Actions', () => {
    it('handles proceed to booking with successful seat updates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockSeats[0], isAvailable: false }),
      } as Response);

      const selectedSeats = [mockSeats[0]];
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { 
          selectedMovie: mockMovie, 
          selectedShowtime: mockShowtime, 
          selectedSeats: selectedSeats, 
          totalPrice: 18.99 
        },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText('Proceed to Booking')).toBeInTheDocument();
      });

      const proceedButton = screen.getByText('Proceed to Booking');
      fireEvent.click(proceedButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/booking/confirmation');
      }, { timeout: 5000 });
    });

    it('handles proceed to booking with selected seats', async () => {
      const selectedSeats = [mockSeats[0]];
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { 
          selectedMovie: mockMovie, 
          selectedShowtime: mockShowtime, 
          selectedSeats: selectedSeats, 
          totalPrice: 18.99 
        },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        const proceedButton = screen.getByText('Proceed to Booking');
        expect(proceedButton).toBeInTheDocument();
        expect(proceedButton).not.toBeDisabled();
      });

      expect(screen.getByText('Selected Seats')).toBeInTheDocument();
      expect(screen.getByText(/A1.*premium/)).toBeInTheDocument();
    });

    it('does not proceed when no seats are selected', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        const proceedButton = screen.getByText('Proceed to Booking');
        expect(proceedButton).toBeDisabled();
      });

      const proceedButton = screen.getByText('Proceed to Booking');
      fireEvent.click(proceedButton);

      // Should not navigate when disabled
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockNavigate).not.toHaveBeenCalledWith('/booking/confirmation');
    });
  });

  describe('Edge Cases', () => {
    it('handles missing showtimeId parameter', async () => {
      // Mock useParams to return empty object (no showtimeId)
      mockUseParams.mockReturnValue({});

      const initialState = {
        seats: { seatsByShowtime: {}, loading: false, error: null, currentShowtimeId: null },
        booking: { selectedMovie: null, selectedShowtime: null, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { 
        preloadedState: initialState,
        route: '/seats'
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('displays help text for seat selection', async () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });

      await waitFor(() => {
        expect(screen.getByText(/Select your preferred seats/)).toBeInTheDocument();
      });

      expect(screen.getByText(/Premium and VIP seats offer enhanced comfort/)).toBeInTheDocument();
      expect(screen.getByText(/Prices may vary by seat type/)).toBeInTheDocument();
    });

    it('handles component unmounting gracefully', () => {
      const initialState = {
        seats: { seatsByShowtime: { 'showtime-1': mockSeats }, loading: false, error: null, currentShowtimeId: 'showtime-1' },
        booking: { selectedMovie: mockMovie, selectedShowtime: mockShowtime, selectedSeats: [], totalPrice: 0 },
        movies: { movies: [mockMovie], loading: false, error: null },
      };

      const { unmount } = renderWithProviders(<SeatSelectionPage />, { preloadedState: initialState });
      
      expect(() => unmount()).not.toThrow();
    });
  });
});
