import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './slices/moviesSlice';
import bookingReducer from './slices/bookingSlice';
import seatsReducer from './slices/seatsSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    booking: bookingReducer,
    seats: seatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
