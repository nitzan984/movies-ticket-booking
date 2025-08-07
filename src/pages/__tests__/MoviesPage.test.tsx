import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import MoviesPage from '../../pages/MoviesPage';
import moviesReducer from '../../store/slices/moviesSlice';
import { type Movie } from '../../types';

// Mock movies data
const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Action Movie',
    description: 'An exciting action movie',
    duration: 120,
    genre: ['Action', 'Adventure'],
    rating: 'PG-13',
    poster: 'action-poster.jpg',
    releaseDate: '2025-08-01',
  },
  {
    id: '2',
    title: 'Comedy Movie',
    description: 'A funny comedy movie',
    duration: 90,
    genre: ['Comedy'],
    rating: 'PG',
    poster: 'comedy-poster.jpg',
    releaseDate: '2025-08-15',
  },
];

// Mock fetch
global.fetch = jest.fn();

// Helper function to render component with all providers
const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = configureStore({
    reducer: {
      movies: moviesReducer,
    },
    preloadedState: initialState,
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('MoviesPage Integration', () => {
  beforeEach(() => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockMovies,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders movies page and displays movies after loading', async () => {
    renderWithProviders(<MoviesPage />);

    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText('Action Movie')).toBeInTheDocument();
      expect(screen.getByText('Comedy Movie')).toBeInTheDocument();
    });

    // Should not show loading anymore
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('allows filtering movies by search', async () => {
    renderWithProviders(<MoviesPage />);

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText('Action Movie')).toBeInTheDocument();
    });

    // Find and use search input
    const searchInput = screen.getByPlaceholderText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'Comedy' } });

    // Should only show comedy movie
    await waitFor(() => {
      expect(screen.getByText('Comedy Movie')).toBeInTheDocument();
      expect(screen.queryByText('Action Movie')).not.toBeInTheDocument();
    });
  });

  it('allows filtering movies by genre', async () => {
    renderWithProviders(<MoviesPage />);

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText('Action Movie')).toBeInTheDocument();
    });

    // Get all Action elements and click the first one (which should be the filter badge)
    const actionElements = screen.getAllByText('Action');
    fireEvent.click(actionElements[0]); // First Action element should be the filter

    // Should only show action movie
    await waitFor(() => {
      expect(screen.getByText('Action Movie')).toBeInTheDocument();
      expect(screen.queryByText('Comedy Movie')).not.toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithProviders(<MoviesPage />);

    // Should show specific error message header
    await waitFor(() => {
      expect(screen.getByText('Error Loading Movies')).toBeInTheDocument();
    });
  });

  it('shows empty state when no movies match filters', async () => {
    renderWithProviders(<MoviesPage />);

    // Wait for movies to load
    await waitFor(() => {
      expect(screen.getByText('Action Movie')).toBeInTheDocument();
    });

    // Search for non-existent movie
    const searchInput = screen.getByPlaceholderText(/search movies/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent Movie' } });

    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText(/no movies found/i)).toBeInTheDocument();
    });
  });
});
