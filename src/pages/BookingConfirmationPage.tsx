import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { type RootState } from "../store";
import {
  resetBooking,
  updateSeatAvailability,
} from "../store/slices/bookingSlice";
import { CheckCircle, Calendar, Clock, MapPin, Ticket } from "lucide-react";

const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedMovie, selectedShowtime, selectedSeats, totalPrice } =
    useSelector((state: RootState) => state.booking);

  useEffect(() => {
    if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
      navigate("/");
    }
  }, [selectedMovie, selectedShowtime, selectedSeats, navigate]);

  const sendAvailableSeatsUpdate = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;
    const availableSeats =
      selectedShowtime.availableSeats - selectedSeats.length;
    try {
      const response = await fetch(
        `http://localhost:3001/showtimes/${selectedShowtime.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedShowtime.id,
            availableSeats: availableSeats,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update seat availability");
      }
      dispatch(
        updateSeatAvailability({
          showtimeId: selectedShowtime.id,
          availableSeats,
        })
      );      
    } catch (error) {
      console.error("Error updating seat availability:", error);
    }
  };

  const handleConfirmBooking = () => {
    sendAvailableSeatsUpdate();

    alert("Booking confirmed! You will receive a confirmation email shortly.");
    dispatch(resetBooking());
    navigate("/");
  };

  // const handleBackToMovies = () => {
  //   dispatch(resetBooking());
  //   navigate('/');
  // };

  if (!selectedMovie || !selectedShowtime || selectedSeats.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const bookingId = `BK${Date.now().toString().slice(-6)}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl bg-gray-700 ">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Confirm Your Booking</h1>
        <p className="text-muted-foreground">
          Please review your booking details before confirming
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Movie Info */}
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{selectedMovie.title}</h3>
              <div className="flex flex-wrap gap-1 mt-1 mb-2">
                {selectedMovie.genre.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedMovie.rating} • {selectedMovie.duration} min
              </p>
            </div>
          </div>

          {/* Showtime Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedShowtime.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTime(selectedShowtime.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Theater Location</span>
            </div>
          </div>

          {/* Seats */}
          <div>
            <h4 className="font-medium mb-2">Selected Seats</h4>
            <div className="grid grid-cols-2 gap-2">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between p-2 bg-muted rounded text-sm"
                >
                  <span>
                    Seat {seat.row}
                    {seat.number}
                  </span>
                  <span>${seat.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking ID */}
          <div className="p-3 bg-muted rounded">
            <div className="flex justify-between items-center">
              <span className="font-medium">Booking ID:</span>
              <span className="font-mono">{bookingId}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Back to Seat Selection
        </Button>
        <Button onClick={handleConfirmBooking} className="flex-1">
          Confirm Booking
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          By confirming this booking, you agree to our terms and conditions.
        </p>
        <p>
          A confirmation email will be sent to your registered email address.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
