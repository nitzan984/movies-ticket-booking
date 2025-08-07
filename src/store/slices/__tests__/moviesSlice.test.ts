import { configureStore } from '@reduxjs/toolkit';
import moviesReducer, {
  setSearchQuery,
  setSelectedGenres,
  setSelectedRatings,
  clearFilters,
  fetchMovies,
} from '../moviesSlice';
import { type Movie } from '../../../types';

// Type for our test store
type TestStore = ReturnType<typeof configureStore<{
  movies: ReturnType<typeof moviesReducer>;
}>>;

// Mock movie data
const mockMovies: Movie[] = [
  {
    id: '1',
    title: 'Test Movie 1',
    description: 'First test movie',
    duration: 120,
    genre: ['Action'],
    rating: 'PG-13',
    poster: 'poster1.jpg',
    releaseDate: '2025-08-01',
  },
  {
    id: '2',
    title: 'Test Comedy Movie',
    description: 'Second test movie',
    duration: 90,
    genre: ['Comedy'],
    rating: 'PG',
    poster: 'poster2.jpg',
    releaseDate: '2025-08-15',
  },
];

// Mock fetch globally
global.fetch = jest.fn();

describe('moviesSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        movies: moviesReducer,
      },
    });
    jest.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = store.getState().movies;
    expect(state).toEqual({
      movies: [],
      filteredMovies: [],
      selectedGenres: [],
      selectedRatings: [],
      searchQuery: '',
      loading: false,
      error: null,
    });
  });

  it('should handle setSearchQuery', () => {
    // First set some movies
    store.dispatch(fetchMovies.fulfilled(mockMovies, 'fetchMovies', undefined));
    
    // Then search for "Comedy"
    store.dispatch(setSearchQuery('Comedy'));
    const state = store.getState().movies;
    
    expect(state.searchQuery).toBe('Comedy');
    expect(state.filteredMovies).toHaveLength(1);
    expect(state.filteredMovies[0].title).toBe('Test Comedy Movie');
  });

  it('should handle setSelectedGenres', () => {
    // First set some movies
    store.dispatch(fetchMovies.fulfilled(mockMovies, 'fetchMovies', undefined));
    
    // Filter by Action genre
    store.dispatch(setSelectedGenres(['Action']));
    const state = store.getState().movies;
    
    expect(state.selectedGenres).toEqual(['Action']);
    expect(state.filteredMovies).toHaveLength(1);
    expect(state.filteredMovies[0].genre).toContain('Action');
  });

  it('should handle setSelectedRatings', () => {
    // First set some movies
    store.dispatch(fetchMovies.fulfilled(mockMovies, 'fetchMovies', undefined));
    
    // Filter by PG rating
    store.dispatch(setSelectedRatings(['PG']));
    const state = store.getState().movies;
    
    expect(state.selectedRatings).toEqual(['PG']);
    expect(state.filteredMovies).toHaveLength(1);
    expect(state.filteredMovies[0].rating).toBe('PG');
  });

  it('should handle clearFilters', () => {
    // Set up some filters first
    store.dispatch(fetchMovies.fulfilled(mockMovies, 'fetchMovies', undefined));
    store.dispatch(setSearchQuery('test'));
    store.dispatch(setSelectedGenres(['Action']));
    store.dispatch(setSelectedRatings(['PG']));

    
    store.dispatch(clearFilters());
    const state = store.getState().movies;
    
    expect(state.searchQuery).toBe('');
    expect(state.selectedGenres).toEqual([]);
    expect(state.selectedRatings).toEqual([]);
    expect(state.filteredMovies).toHaveLength(2); 
  });

  describe('fetchMovies async thunk', () => {
    it('should handle fetchMovies.pending', () => {
      store.dispatch(fetchMovies.pending('fetchMovies', undefined));
      const state = store.getState().movies;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchMovies.fulfilled', () => {
      store.dispatch(fetchMovies.fulfilled(mockMovies, 'fetchMovies', undefined));
      const state = store.getState().movies;
      
      expect(state.loading).toBe(false);
      expect(state.movies).toEqual(mockMovies);
      expect(state.filteredMovies).toEqual(mockMovies);
      expect(state.error).toBeNull();
    });

    it('should handle fetchMovies.rejected', () => {
      const errorMessage = 'Failed to fetch movies';
      store.dispatch(fetchMovies.rejected(new Error(errorMessage), 'fetchMovies', undefined, errorMessage));
      const state = store.getState().movies;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.movies).toEqual([]);
      expect(state.filteredMovies).toEqual([]);
    });
  });
});
