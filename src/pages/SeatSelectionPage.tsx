import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import SeatMap from '../components/SeatMap';
import { type AppDispatch, type RootState } from '../store';
import { clearSelection, resetBooking, setSelectedMovie, setSelectedShowtime } from '../store/slices/bookingSlice';
import { AlertCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { initializeSeatsForShowtime, updateSeatAvailability, selectSeatsByShowtimeId } from '../store/slices/seatsSlice';
import { toast } from 'sonner';

const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  // Create a ref to track which showtime is currently being initialized to prevent duplicates
  const initializationRef = useRef<string | null>(null);
  
  const { 
    selectedMovie,     
    selectedShowtime,  
    selectedSeats,     
    totalPrice         
  } = useSelector((state: RootState) => state.booking);
  
  const { loading, error } = useSelector((state: RootState) => state.seats);
  const seats = useSelector((state: RootState) => showtimeId ? selectSeatsByShowtimeId(state, showtimeId) : []);

  useEffect(() => {
    const fetchMissingData = async () => {
      
      // Prevent duplicate initialization by checking if this showtime is already being processed
      if (initializationRef.current === showtimeId) {
        return; // Exit early to prevent duplicate API calls
      }
      
      // Check if required movie or showtime data is missing from Redux state
      if (!selectedMovie || !selectedShowtime) {
        
        if (!showtimeId) {
          navigate('/');
          return;
        }
        
        try {
          
          const showtimeResponse = await fetch(`http://localhost:3001/showtimes/${showtimeId}`);

          if (!showtimeResponse.ok) {
            throw new Error('Showtime not found');
          }
          const showtimeData = await showtimeResponse.json();
          console.log('Fetched showtime data:', showtimeData);
          
          const movieResponse = await fetch(`http://localhost:3001/movies/${showtimeData.movieId}`);
          if (!movieResponse.ok) {
            throw new Error('Movie not found');
          }

          const movieData = await movieResponse.json();
          
          dispatch(setSelectedMovie(movieData));     
          dispatch(setSelectedShowtime(showtimeData)); 
          
          initializationRef.current = showtimeId;
          dispatch(initializeSeatsForShowtime(showtimeId));
        } catch (error) {
          toast.error(`Failed to fetch missing data: ${error}`);
          navigate('/');
        }
      } else {
        
        if (showtimeId && initializationRef.current !== showtimeId) {
          initializationRef.current = showtimeId; // Mark as being initialized
          dispatch(initializeSeatsForShowtime(showtimeId)); // Initialize seats
        }
      }
    };

    fetchMissingData();
  }, [selectedMovie, selectedShowtime, showtimeId, navigate, dispatch]);

  // Handler function for proceeding to booking confirmation
  const handleProceedToBooking = async () => {
    if (selectedSeats.length === 0) return;

    // Create array of promises to update seat availability in parallel
    // This marks selected seats as unavailable (optimistic update)
    const updatePromises = selectedSeats.map(seat => 
      dispatch(updateSeatAvailability({ seatId: seat.id, isAvailable: false }))
    );

    try {
      // Wait for all seat availability updates to complete
      await Promise.all(updatePromises);
      navigate('/booking/confirmation');
    } catch (error) {            
      toast.error(`Failed to book seats. Please try again. ${error}`);
      // Re-fetch seats to revert optimistic updates and show current state
      dispatch(initializeSeatsForShowtime(showtimeId!)); 
    }
  };

  const handleClearSelection = () => {
    dispatch(clearSelection());
  };


  if (loading) {
    return (
      // Container with responsive padding and margins
      <div className="container mx-auto px-4 py-8">
        {/* Centered loading indicator */}
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading seats...</div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Seats</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => { dispatch(resetBooking()); navigate('/'); }} className="mt-4">
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedMovie || !selectedShowtime || seats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Seats Found</h2>
          <p className="text-muted-foreground">
            No seat data available for this showtime or an error occurred.
          </p>
          <Button onClick={() => { dispatch(resetBooking()); navigate('/'); }} className="mt-4">
            Back to Movies
          </Button>
        </div>
      </div>
    );
  }


  const formatTime = (dateString: string) => {
    // Convert ISO date string to localized time format (e.g., "2:30 PM")
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',        
      minute: '2-digit',     
      hour12: true,          
    });
  };

  const formatDate = (dateString: string) => {
    // Convert ISO date string to localized date format (e.g., "Monday, August 7, 2025")
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',       
      year: 'numeric',       
      month: 'long',         
      day: 'numeric',        
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      
      <Button
        variant="ghost"                     
        onClick={() => navigate(-1)}      
        className="mb-6"                   
      >
   
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Showtimes
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className='border-2 border-orange-500'>
            <CardHeader>
              {/* Main title */}
              <CardTitle>Select Your Seats</CardTitle>
              <div className="text-sm text-muted-foreground">
                <p>{selectedMovie.title}</p>
                <p>{formatDate(selectedShowtime.startTime)} at {formatTime(selectedShowtime.startTime)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <SeatMap seats={seats} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedMovie.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedShowtime.startTime)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(selectedShowtime.startTime)}
                </p>
              </div>

              {selectedSeats.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Selected Seats</h4>
                  <div className="space-y-1">
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between text-sm">
                        <span>{seat.row}{seat.number} ({seat.type})</span>
                        <span>${seat.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total ({selectedSeats.length} seats)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleProceedToBooking}        
                  disabled={selectedSeats.length === 0}   
                  className="w-full"                       
                >
                  Proceed to Booking
                </Button>
                {selectedSeats.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearSelection}
                    className="w-full"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>

              
              <div className="text-xs text-muted-foreground">
                <p>• Select your preferred seats</p>
                <p>• Premium and VIP seats offer enhanced comfort</p>
                <p>• Prices may vary by seat type</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
