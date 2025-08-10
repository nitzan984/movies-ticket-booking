import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import ShowtimeCard from '../components/ShowtimeCard';
import { type RootState } from '../store';
import { setSelectedMovie } from '../store/slices/bookingSlice';
import { type Movie, type Showtime, type Theater } from '../types'; // Import types
import placeholderImage from "../assets/placeholder.svg";
import { ArrowLeft, Calendar, Clock, Star, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { toast } from 'sonner';

const ShowtimesPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie } = useSelector((state: RootState) => state.booking);

  const [movie, setMovie] = useState<Movie | null>(selectedMovie);
  const [movieShowtimes, setMovieShowtimes] = useState<Showtime[]>([]);
  const [theatersData, setTheatersData] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowtimeData = async () => {
      if (!movieId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch movie details
        const movieResponse = await fetch(`http://localhost:3001/movies/${movieId}`);
        if (!movieResponse.ok) {
          throw new Error('Movie not found');
        }
        const fetchedMovie: Movie = await movieResponse.json();
        setMovie(fetchedMovie);
        dispatch(setSelectedMovie(fetchedMovie));

        // Fetch showtimes for the movie
        const showtimesResponse = await fetch(`http://localhost:3001/showtimes?movieId=${movieId}`);
        if (!showtimesResponse.ok) {
          throw new Error('Showtimes not found');
        }
        const fetchedShowtimes: Showtime[] = await showtimesResponse.json();
        setMovieShowtimes(fetchedShowtimes);

        // Fetch all theaters (or filter by theaterId from showtimes if needed)
        const theatersResponse = await fetch('http://localhost:3001/theaters');
        if (!theatersResponse.ok) {
          throw new Error('Theaters not found');
        }
        const fetchedTheaters: Theater[] = await theatersResponse.json();
        setTheatersData(fetchedTheaters);

      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || 'Failed to fetch showtime data');
        } else {
          setError('Failed to fetch showtime data');
        }
        
        toast.error(`Error fetching showtime data: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeData();
  }, [movieId, dispatch, navigate, error]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading showtimes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Showtimes</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground">
            The movie you are looking for does not exist.
          </p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900">
      
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Movies
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <img
          loading="lazy"
          src={`https://picsum.photos/seed/${movie.id}/200/300`}
          alt={movie.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderImage;
          }}
        />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span className="font-medium">Rating:</span>
              <span>{movie.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Duration:</span>
              <span>{formatDuration(movie.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Release:</span>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Synopsis</h3>
            <p className="text-muted-foreground leading-relaxed">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Showtimes</h2>
        {movieShowtimes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No showtimes available for this movie.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {movieShowtimes.map((showtime) => {
              const theater = theatersData.find(t => t.id === showtime.theaterId);
              return theater ? (
                <ShowtimeCard
                  key={showtime.id}
                  showtime={showtime}
                  theater={theater}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimesPage;
