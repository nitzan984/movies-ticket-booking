import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { type Movie } from '../../types';


interface MoviesState {
  movies: Movie[];
  filteredMovies: Movie[];
  selectedGenres: string[];
  selectedRatings: string[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  movies: [], 
  filteredMovies: [], 
  selectedGenres: [],
  selectedRatings: [],
  searchQuery: '',
  loading: false,
  error: null,
};


export const fetchMovies = createAsyncThunk<Movie[], void, { rejectValue: string }>(
  'movies/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3001/movies');
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data: Movie[] = await response.json();
      return data;
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      filterMovies(state);
    },
    setSelectedGenres: (state, action: PayloadAction<string[]>) => {
      state.selectedGenres = action.payload;
      filterMovies(state);
    },
    setSelectedRatings: (state, action: PayloadAction<string[]>) => {
      state.selectedRatings = action.payload;
      filterMovies(state);
    },
    clearFilters: (state) => {
      state.selectedGenres = [];
      state.selectedRatings = [];
      state.searchQuery = '';
      state.filteredMovies = state.movies;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action: PayloadAction<Movie[]>) => {
        state.loading = false;
        state.movies = action.payload;
        filterMovies(state);
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        state.movies = [];
        state.filteredMovies = [];
      });
  },
});

const filterMovies = (state: MoviesState) => {
  let filtered = state.movies;

  // Filter by search query
  if (state.searchQuery) {
    filtered = filtered.filter(movie =>
      movie.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
  }

  // Filter by genres
  if (state.selectedGenres.length > 0) {
    filtered = filtered.filter(movie =>
      movie.genre.some(genre => state.selectedGenres.includes(genre))
    );
  }

  // Filter by ratings
  if (state.selectedRatings.length > 0) {
    filtered = filtered.filter(movie =>
      state.selectedRatings.includes(movie.rating)
    );
  }

  state.filteredMovies = filtered;
};

export const { setSearchQuery, setSelectedGenres, setSelectedRatings, clearFilters } = moviesSlice.actions;
export default moviesSlice.reducer;
