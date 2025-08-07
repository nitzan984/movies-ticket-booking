import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MovieCard from '../MovieCard';
import { type Movie } from '../../types';

// Mock movie data for testing
const mockMovie: Movie = {
  id: '1',
  title: 'Test Movie',
  description: 'A great test movie',
  duration: 120,
  genre: ['Action', 'Adventure'],
  rating: 'PG-13',
  poster: 'https://example.com/poster.jpg',
  releaseDate: '2025-08-01',
};

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MovieCard', () => {
  it('renders movie information correctly', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />);
    
    // Check if movie title is displayed
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    
    // Check if genre is displayed
    expect(screen.getByText('Action')).toBeInTheDocument();
    
    // Check if rating is displayed
    expect(screen.getByText('PG-13')).toBeInTheDocument();
    
    // Check if duration is displayed
    expect(screen.getByText('120 min')).toBeInTheDocument();
  });

  it('displays poster image with correct alt text', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />);
    
    const posterImage = screen.getByAltText('Test Movie');
    expect(posterImage).toBeInTheDocument();
    // The component uses picsum.photos with movie ID as seed
    expect(posterImage).toHaveAttribute('src', 'https://picsum.photos/seed/1/200/300');
  });

  it('renders "View Showtimes" button', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />);
    
    const viewShowtimesButton = screen.getByText('View Showtimes');
    expect(viewShowtimesButton).toBeInTheDocument();
  });

  it('has a clickable View Showtimes button', () => {
    renderWithRouter(<MovieCard movie={mockMovie} />);
    
    const viewShowtimesButton = screen.getByRole('button', { name: 'View Showtimes' });
    expect(viewShowtimesButton).toBeInTheDocument();
    expect(viewShowtimesButton).toBeEnabled();
  });

  it('handles missing poster image gracefully', () => {
    const movieWithoutPoster = { ...mockMovie, poster: '' };
    renderWithRouter(<MovieCard movie={movieWithoutPoster} />);
    
    // Should still render the movie title
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
