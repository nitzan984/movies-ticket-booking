import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { type RootState, type AppDispatch } from '../store'; 
import MovieCard from '../components/MovieCard';
import MovieFilters from '../components/MovieFilters';
import { AlertCircle } from 'lucide-react';
import { fetchMovies } from '../store/slices/moviesSlice'; 

const MoviesPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); 
  
  const { filteredMovies, loading, error } = useSelector((state: RootState) => state.movies);

  useEffect(() => {
    dispatch(fetchMovies()); 
  }, [dispatch]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading movies...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Movies</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Now Showing</h1>
        <p className="text-muted-foreground">
          Discover the latest movies and book your tickets
        </p>
      </div>

      <MovieFilters />

      {filteredMovies.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Movies Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or clear the filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
