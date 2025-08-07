import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { type RootState } from '../store';
import { setSearchQuery, setSelectedGenres, setSelectedRatings, clearFilters } from '../store/slices/moviesSlice';
import { Search, X } from 'lucide-react';

const MovieFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { searchQuery, selectedGenres, selectedRatings, movies } = useSelector(
    (state: RootState) => state.movies
  );

  // Get unique genres and ratings from all movies
  const allGenres = Array.from(new Set(movies.flatMap(movie => movie.genre)));
  const allRatings = Array.from(new Set(movies.map(movie => movie.rating)));

  const handleGenreToggle = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    dispatch(setSelectedGenres(newGenres));
  };

  const handleRatingToggle = (rating: string) => {
    const newRatings = selectedRatings.includes(rating)
      ? selectedRatings.filter(r => r !== rating)
      : [...selectedRatings, rating];
    dispatch(setSelectedRatings(newRatings));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters = searchQuery || selectedGenres.length > 0 || selectedRatings.length > 0;

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters} className="shrink-0">
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Genre Filters */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Genres</h4>
        <div className="flex flex-wrap gap-2">
          {allGenres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenres.includes(genre) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>

      {/* Rating Filters */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Ratings</h4>
        <div className="flex flex-wrap gap-2">
          {allRatings.map((rating) => (
            <Badge
              key={rating}
              variant={selectedRatings.includes(rating) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => handleRatingToggle(rating)}
            >
              {rating}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;
