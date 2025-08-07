import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { type Showtime,type Theater } from '../types';
import { setSelectedShowtime } from '../store/slices/bookingSlice';
import { Clock, MapPin, Users } from 'lucide-react';

interface ShowtimeCardProps {
  showtime: Showtime;
  theater: Theater;
}

const ShowtimeCard: React.FC<ShowtimeCardProps> = ({ showtime, theater }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectSeats = () => {
    dispatch(setSelectedShowtime(showtime));
    navigate(`/booking/${showtime.id}/seats`);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isAvailable = showtime.availableSeats > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{theater.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">{theater.location}</div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(showtime.startTime)} at {formatTime(showtime.startTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{showtime.availableSeats}/{showtime.totalSeats} available</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">${showtime.price}</span>
              {!isAvailable && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
            </div>
          </div>
          <Button
            onClick={handleSelectSeats}
            disabled={!isAvailable}
            className="shrink-0"
          >
            {isAvailable ? 'Select Seats' : 'Sold Out'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowtimeCard;
