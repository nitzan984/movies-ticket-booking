import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { type Seat } from '../../types';
import { type RootState } from '../index'; // Import RootState for getState

interface SeatsState {
  seats: Seat[];
  loading: boolean;
  error: string | null;
  currentShowtimeId: string | null; // Track the current showtime being displayed
}

const initialState: SeatsState = {
  seats: [],
  loading: false,
  error: null,
  currentShowtimeId: null,
};

// Helper function to generate seats (moved here)
export const generateSeats = (showtimeId: string): Seat[] => {
  const seats: Seat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  rows.forEach((row, rowIndex) => {
    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
      const seatType = rowIndex < 2 ? 'premium' : rowIndex < 6 ? 'regular' : 'vip';
      const basePrice = seatType === 'premium' ? 18.99 : seatType === 'vip' ? 22.99 : 12.99;
      
      seats.push({
        id: `${showtimeId}-${row}${seatNumber}`,
        row,
        number: seatNumber,
        isAvailable: Math.random() > 0.3, // 70% chance of being available
        isSelected: false,
        type: seatType,
        price: basePrice,
        showtimeId
      });
    }
  });

  return seats;
};

// 1. getSeats (fetchSeatsByShowtimeId)
export const fetchSeatsByShowtimeId = createAsyncThunk<Seat[], string, { rejectValue: string }>(
  'seats/fetchSeats',
  async (showtimeId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/seats?showtimeId=${showtimeId}`);
      if (!response.ok) {
        // If response is not OK, it's a server error
        throw new Error(`Server error: ${response.statusText}`);
      }
      const data: Seat[] = await response.json();
      // Always return data, even if empty. Let initializeSeatsForShowtime decide if it needs to generate.
      return data;
    } catch (error: unknown) {
      // Catch network errors or errors from the above throw
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An unknown error occurred while fetching seats.');
    }
  }
);

// 2. setSeats (initializeSeatsForShowtime)
export const initializeSeatsForShowtime = createAsyncThunk<Seat[], string, { state: RootState, rejectValue: string }>(
  'seats/initializeSeatsForShowtime',
  async (showtimeId, { dispatch, rejectWithValue, getState }) => {
    console.log('Starting seat initialization for showtime:', showtimeId);
    
    // Check if we already have seats for this showtime
    const state = getState();
    if (state.seats.currentShowtimeId === showtimeId && state.seats.seats.length > 0) {
      console.log('Seats already loaded for this showtime:', showtimeId);
      return state.seats.seats;
    }
    
    // First, try to fetch existing seats
    const existingSeatsResponse = await dispatch(fetchSeatsByShowtimeId(showtimeId));

    if (fetchSeatsByShowtimeId.fulfilled.match(existingSeatsResponse)) {
      console.log('Fetched existing seats:', existingSeatsResponse.payload.length);
      
      if (existingSeatsResponse.payload.length > 0) {
        // Seats already exist, return them
        console.log('Using existing seats');
        return existingSeatsResponse.payload;
      } else {
        // No seats found for this showtime, generate and post new ones
        console.log('No existing seats found, generating new ones');
        const newSeats = generateSeats(showtimeId);
        
        try {
          console.log(`Creating ${newSeats.length} seats for showtime ${showtimeId}`);
          
          // Use Promise.all to create all seats in parallel for better performance
          const createPromises = newSeats.map(seat => 
            fetch('http://localhost:3001/seats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(seat),
            }).then(response => {
              if (!response.ok) {
                throw new Error(`Failed to create seat ${seat.id}: ${response.statusText}`);
              }
              return response.json();
            })
          );
          
          const createdSeats = await Promise.all(createPromises);
          
          console.log(`Successfully created ${createdSeats.length} seats`);
          return createdSeats;
        } catch (error: unknown) {
          console.error('Error creating seats:', error);
          if (error instanceof Error) {
            return rejectWithValue(error.message || 'Failed to initialize seats');
          }
          return rejectWithValue('Failed to initialize seats');
        }
      }
    } else {
      // If fetching existing seats was rejected, propagate that error
      return rejectWithValue(existingSeatsResponse.payload || 'Failed to fetch existing seats before initialization.');
    }
  }
);

// 3. updateSeats (updateSeatAvailability)
export const updateSeatAvailability = createAsyncThunk<Seat, { seatId: string; isAvailable: boolean }, { rejectValue: string }>(
  'seats/updateSeatAvailability',
  async ({ seatId, isAvailable }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/seats/${seatId}`, {
        method: 'PATCH', // Use PATCH to update specific fields
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update seat ${seatId}`);
      }
      const updatedSeat: Seat = await response.json();
      return updatedSeat;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || 'Failed to update seat availability');
      }
      return rejectWithValue('Failed to update seat availability');
    }
  }
);

const seatsSlice = createSlice({
  name: 'seats',
  initialState,
  reducers: {
    // Clear seats when navigating away
    clearSeats: (state) => {
      state.seats = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeatsByShowtimeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeatsByShowtimeId.fulfilled, (state, action: PayloadAction<Seat[]>) => {
        state.loading = false;
        state.seats = action.payload;
      })
      .addCase(fetchSeatsByShowtimeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong fetching seats';
        state.seats = [];
      })
      .addCase(initializeSeatsForShowtime.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Track which showtime is being initialized
        state.currentShowtimeId = action.meta.arg;
      })
      .addCase(initializeSeatsForShowtime.fulfilled, (state, action: PayloadAction<Seat[]>) => {
        state.loading = false;
        state.seats = action.payload;
        // Keep the current showtime ID
      })
      .addCase(initializeSeatsForShowtime.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong initializing seats';
        state.seats = [];
        state.currentShowtimeId = null;
      })
      .addCase(updateSeatAvailability.fulfilled, (state, action: PayloadAction<Seat>) => {
        const index = state.seats.findIndex(seat => seat.id === action.payload.id);
        if (index !== -1) {
          state.seats[index] = action.payload;
        }
      })
      .addCase(updateSeatAvailability.rejected, (_, action) => {
        console.error('Failed to update seat availability:', action.payload);
        // Optionally set an error state or show a toast
      });
  },
});

export const { clearSeats } = seatsSlice.actions;

export default seatsSlice.reducer;
