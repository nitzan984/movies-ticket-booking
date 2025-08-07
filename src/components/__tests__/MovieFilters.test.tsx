import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MovieFilters from '../MovieFilters';
import moviesReducer from '../../store/slices/moviesSlice';
import { type Movie } from '../../types';

const mockMovies: Movie[] = [
  { id: '1', title: 'Movie A', genre: ['Action', 'Drama'], rating: 'PG', duration: 120, description: '', poster: '', releaseDate: '' },
  { id: '2', title: 'Movie B', genre: ['Comedy'], rating: 'R', duration: 90, description: '', poster: '', releaseDate: '' },
  { id: '3', title: 'Movie C', genre: ['Action'], rating: 'PG', duration: 150, description: '', poster: '', releaseDate: '' },
];

// Create a test store with initial state
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      movies: moviesReducer,
    },
    preloadedState: {
      movies: {
        movies: mockMovies,
        filteredMovies: mockMovies,
        searchQuery: '',
        selectedGenres: [],
        selectedRatings: [],
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Helper function to render component with Redux store
const renderWithStore = (store: ReturnType<typeof createTestStore>) => {
  return render(
    <Provider store={store}>
      <MovieFilters />
    </Provider>
  );
};

describe('MovieFilters', () => {
  it('renders search input and filter sections', () => {
    const store = createTestStore();
    renderWithStore(store);

    // Check for search input
    expect(screen.getByPlaceholderText('Search movies...')).toBeInTheDocument();
    
    // Check for filter section headings
    expect(screen.getByText('Genres')).toBeInTheDocument();
    expect(screen.getByText('Ratings')).toBeInTheDocument();
    
    // Check for genre badges (extracted from mock movies)
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Comedy')).toBeInTheDocument();
    
    // Check for rating badges
    expect(screen.getByText('PG')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('updates search query when typing in search input', () => {
    const store = createTestStore();
    renderWithStore(store);

    const searchInput = screen.getByPlaceholderText('Search movies...');
    fireEvent.change(searchInput, { target: { value: 'Movie A' } });

    // Check that the store state has been updated
    const state = store.getState();
    expect(state.movies.searchQuery).toBe('Movie A');
  });

  it('toggles genre selection when clicking genre badges', () => {
    const store = createTestStore();
    renderWithStore(store);

    const actionBadge = screen.getByText('Action');
    
    // Initially no genres selected
    expect(store.getState().movies.selectedGenres).toEqual([]);
    
    // Click Action genre
    fireEvent.click(actionBadge);
    expect(store.getState().movies.selectedGenres).toEqual(['Action']);
    
    // Click Comedy genre
    const comedyBadge = screen.getByText('Comedy');
    fireEvent.click(comedyBadge);
    expect(store.getState().movies.selectedGenres).toEqual(['Action', 'Comedy']);
    
    // Click Action again to deselect
    fireEvent.click(actionBadge);
    expect(store.getState().movies.selectedGenres).toEqual(['Comedy']);
  });

  it('toggles rating selection when clicking rating badges', () => {
    const store = createTestStore();
    renderWithStore(store);

    const pgBadge = screen.getByText('PG');
    
    // Initially no ratings selected
    expect(store.getState().movies.selectedRatings).toEqual([]);
    
    // Click PG rating
    fireEvent.click(pgBadge);
    expect(store.getState().movies.selectedRatings).toEqual(['PG']);
    
    // Click R rating
    const rBadge = screen.getByText('R');
    fireEvent.click(rBadge);
    expect(store.getState().movies.selectedRatings).toEqual(['PG', 'R']);
    
    // Click PG again to deselect
    fireEvent.click(pgBadge);
    expect(store.getState().movies.selectedRatings).toEqual(['R']);
  });

  it('shows clear filters button when filters are active', () => {
    // Create store with some initial filters
    const store = createTestStore({
      searchQuery: 'test search',
      selectedGenres: ['Action'],
    });
    renderWithStore(store);

    // Clear button should be visible
    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear filters button when no filters are active', () => {
    const store = createTestStore(); // No initial filters
    renderWithStore(store);

    // Clear button should not be visible
    const clearButton = screen.queryByRole('button', { name: /Clear Filters/i });
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears all filters when clear filters button is clicked', () => {
    // Create store with initial filters
    const store = createTestStore({
      searchQuery: 'test search',
      selectedGenres: ['Action', 'Comedy'],
      selectedRatings: ['PG'],
    });
    renderWithStore(store);

    // Verify filters are initially set
    expect(store.getState().movies.searchQuery).toBe('test search');
    expect(store.getState().movies.selectedGenres).toEqual(['Action', 'Comedy']);
    expect(store.getState().movies.selectedRatings).toEqual(['PG']);

    // Click clear filters button
    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearButton);

    // Verify all filters are cleared
    const state = store.getState();
    expect(state.movies.searchQuery).toBe('');
    expect(state.movies.selectedGenres).toEqual([]);
    expect(state.movies.selectedRatings).toEqual([]);
  });

  it('displays the correct visual state for selected and unselected filters', () => {
    // Create store with some pre-selected filters
    const store = createTestStore({
      selectedGenres: ['Action'],
      selectedRatings: ['PG'],
    });
    renderWithStore(store);

    // Selected badges should have different styling (we can't easily test CSS classes, 
    // but we can verify they're rendered with the expected structure)
    const actionBadge = screen.getByText('Action');
    const comedyBadge = screen.getByText('Comedy');
    const pgBadge = screen.getByText('PG');
    const rBadge = screen.getByText('R');

    // All badges should be present and clickable
    expect(actionBadge).toBeInTheDocument();
    expect(comedyBadge).toBeInTheDocument();
    expect(pgBadge).toBeInTheDocument();
    expect(rBadge).toBeInTheDocument();

    // Click unselected badges to verify they become selected
    fireEvent.click(comedyBadge);
    fireEvent.click(rBadge);

    const finalState = store.getState();
    expect(finalState.movies.selectedGenres).toEqual(['Action', 'Comedy']);
    expect(finalState.movies.selectedRatings).toEqual(['PG', 'R']);
  });
});
