import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { type Seat } from '../types';
import { type RootState } from '../store';
import { toggleSeatSelection } from '../store/slices/bookingSlice';
import { cn } from '../lib/utils';

interface SeatMapProps {
  seats: Seat[];
}

const SeatMap: React.FC<SeatMapProps> = ({ seats }) => {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state: RootState) => state.booking);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    dispatch(toggleSeatSelection(seat));
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.isAvailable) return 'bg-gray-400 cursor-not-allowed';
    if (selectedSeats.some(s => s.id === seat.id)) return 'bg-primary text-primary-foreground';
    
    switch (seat.type) {
      case 'premium':
        return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400';
      case 'vip':
        return 'bg-purple-200 hover:bg-purple-300 border-purple-400';
      default:
        return 'bg-green-200 hover:bg-green-300 border-green-400';
    }
  };

  // Ensure seats is an array
  if (!Array.isArray(seats)) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No seats available</p>
      </div>
    );
  }

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Screen */}
      <div className="mb-8">
        <div className="w-full h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mb-2"></div>
        <p className="text-center text-sm text-muted-foreground">SCREEN</p>
      </div>

      {/* Show message if no seats available */}
      {seats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No seats available for this showtime</p>
        </div>
      ) : (
        /* Seat Map */
        <div className="space-y-3">
          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <div className="w-8 text-center font-medium text-sm">{row}</div>
              <div className="flex gap-1">
                {rowSeats.map((seat) => (
                  <Button
                    key={seat.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      'w-8 h-8 p-0 text-xs border-2',
                      getSeatColor(seat)
                    )}
                    onClick={() => handleSeatClick(seat)}
                    disabled={!seat.isAvailable}
                    title={`${seat.row}${seat.number} - ${seat.type} - $${seat.price}`}
                  >
                    {seat.number}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
          <span>Regular ($12.99)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
          <span>Premium ($18.99)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded"></div>
          <span>VIP ($22.99)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
