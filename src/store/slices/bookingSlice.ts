import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import { type Movie,type Showtime,type Seat,type BookingState } from '../../types';

const initialState: BookingState = {
  selectedMovie: null,
  selectedShowtime: null,
  selectedSeats: [],
  totalPrice: 0,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedMovie: (state, action: PayloadAction<Movie>) => {
      state.selectedMovie = action.payload;
    },
    setSelectedShowtime: (state, action: PayloadAction<Showtime>) => {
      state.selectedShowtime = action.payload;
    },
    toggleSeatSelection: (state, action: PayloadAction<Seat>) => {
      const seat = action.payload;
      const existingIndex = state.selectedSeats.findIndex(s => s.id === seat.id);
      
      if (existingIndex >= 0) {
        state.selectedSeats.splice(existingIndex, 1);
      } else {
        state.selectedSeats.push({ ...seat, isSelected: true });
      }
      
      state.totalPrice = state.selectedSeats.reduce((total, seat) => total + seat.price, 0);
    },
    clearSelection: (state) => {
      state.selectedSeats = [];
      state.totalPrice = 0;
    },
    resetBooking: (state) => {
      state.selectedMovie = null;
      state.selectedShowtime = null;
      state.selectedSeats = [];
      state.totalPrice = 0;
    },
  },
});

export const {
  setSelectedMovie,
  setSelectedShowtime,
  toggleSeatSelection,
  clearSelection,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
