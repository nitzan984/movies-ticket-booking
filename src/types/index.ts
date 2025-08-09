export interface Movie {
  id: string;
  title: string;
  genre: string[];
  rating: string;
  duration: number;
  description: string;
  poster: string;
  releaseDate: string;
}

export interface Theater {
  id: string;
  name: string;
  location: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterId: string;
  startTime: string;
  endTime: string;
  price: number;
  seatsPerRow: number;
  rows: string[];
  availableSeats: number;
  totalSeats: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
  type: 'regular' | 'premium' | 'vip';
  price: number;
  showtimeId:string;
}

export interface Booking {
  id: string;
  movieId: string;
  showtimeId: string;
  seats: Seat[];
  totalPrice: number;
  bookingDate: string;
}

export interface BookingState {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  totalPrice: number;
}
