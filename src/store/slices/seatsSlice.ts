import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { type Seat, type Showtime } from "../../types";
import { type RootState } from "../index"; // Import RootState for getState

interface SeatsState {
  seatsByShowtime: { [showtimeId: string]: Seat[] };
  loading: boolean;
  error: string | null;
  currentShowtimeId: string | null;
}

const initialState: SeatsState = {
  seatsByShowtime: {},
  loading: false,
  error: null,
  currentShowtimeId: null,
};

// Helper function to generate seats (moved here)
export const generateSeats = (showtime: Showtime): Seat[] => {
  const seats: Seat[] = [];
  showtime.rows.forEach((row, rowIndex) => {
    for (let seatNumber = 1; seatNumber <= showtime.seatsPerRow; seatNumber++) {
      const seatType =
        rowIndex < 2 ? "premium" : rowIndex < 6 ? "regular" : "vip";
      const basePrice =
        seatType === "premium" ? 18.99 : seatType === "vip" ? 22.99 : 12.99;

      seats.push({
        id: `${showtime.id}-${row}${seatNumber}`,
        row,
        number: seatNumber,
        // isAvailable: Math.random() > 0.3,
        isAvailable: true, 
        isSelected: false,
        type: seatType,
        price: basePrice,
        showtimeId: showtime.id,
      });
    }
  });

  return seats;
};

// Selector function to get seats for a specific showtime (memoized)
export const selectSeatsByShowtimeId = createSelector(
  [
    (state: RootState) => state.seats.seatsByShowtime,
    (_state: RootState, showtimeId: string) => showtimeId,
  ],
  (seatsByShowtime, showtimeId) => seatsByShowtime[showtimeId] || []
);

// 1. getSeats (fetchSeatsByShowtimeId)
export const fetchSeatsByShowtimeId = createAsyncThunk<
  Seat[],
  string,
  { rejectValue: string }
>("seats/fetchSeats", async (showtimeId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `http://localhost:3001/seats?showtimeId=${showtimeId}`
    );
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
    return rejectWithValue("An unknown error occurred while fetching seats.");
  }
});

// 2. setSeats (initializeSeatsForShowtime)
export const initializeSeatsForShowtime = createAsyncThunk<
  Seat[],
  string,
  { state: RootState; rejectValue: string }
>(
  "seats/initializeSeatsForShowtime",
  async (showtimeId, { dispatch, rejectWithValue, getState }) => {
    // Check if we already have seats for this showtime
    const state = getState();
    if (
      state.seats.currentShowtimeId === showtimeId &&
      state.seats.seatsByShowtime[showtimeId]?.length > 0
    ) {
      return state.seats.seatsByShowtime[showtimeId];
    }

    // First, try to fetch existing seats
    const existingSeatsResponse = await dispatch(
      fetchSeatsByShowtimeId(showtimeId)
    );

    if (fetchSeatsByShowtimeId.fulfilled.match(existingSeatsResponse)) {
      if (existingSeatsResponse.payload.length > 0) {
        // Seats already exist, return them
        return existingSeatsResponse.payload;
      } else {
        // No seats found for this showtime, generate and post new ones
        const newSeats = generateSeats(state.booking.selectedShowtime!);

        try {
          // Use Promise.all to create all seats in parallel for better performance
          const createPromises = newSeats.map((seat) =>
            fetch("http://localhost:3001/seats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(seat),
            }).then((response) => {
              if (!response.ok) {
                throw new Error(
                  `Failed to create seat ${seat.id}: ${response.statusText}`
                );
              }
              return response.json();
            })
          );

          const createdSeats = await Promise.all(createPromises);

          return createdSeats;
        } catch (error: unknown) {
          if (error instanceof Error) {
            return rejectWithValue(
              error.message || "Failed to initialize seats"
            );
          }
          return rejectWithValue("Failed to initialize seats");
        }
      }
    } else {
      // If fetching existing seats was rejected, propagate that error
      return rejectWithValue(
        existingSeatsResponse.payload ||
          "Failed to fetch existing seats before initialization."
      );
    }
  }
);

// 3. updateSeats (updateSeatAvailability)
export const updateSeatAvailability = createAsyncThunk<
  Seat,
  { seatId: string; isAvailable: boolean },
  { rejectValue: string }
>(
  "seats/updateSeatAvailability",
  async ({ seatId, isAvailable }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:3001/seats/${seatId}`, {
        method: "PATCH", // Use PATCH to update specific fields
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update seat ${seatId}`);
      }
      const updatedSeat: Seat = await response.json();
      return updatedSeat;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(
          error.message || "Failed to update seat availability"
        );
      }
      return rejectWithValue("Failed to update seat availability");
    }
  }
);

const seatsSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {
    // Clear seats when navigating away
    clearSeats: (state) => {
      state.seatsByShowtime = {};
      state.error = null;
      state.currentShowtimeId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeatsByShowtimeId.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Set the current showtime ID from the action argument
        state.currentShowtimeId = action.meta.arg;
      })
      .addCase(
        fetchSeatsByShowtimeId.fulfilled,
        (state, action: PayloadAction<Seat[]>) => {
          state.loading = false;
          // Store seats by showtime ID
          const showtimeId = state.currentShowtimeId;
          if (showtimeId) {
            state.seatsByShowtime[showtimeId] = action.payload;
          }
        }
      )
      .addCase(fetchSeatsByShowtimeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong fetching seats";
        // Don't clear existing seats on fetch error, just clear current showtime seats
        const showtimeId = state.currentShowtimeId;
        if (showtimeId) {
          state.seatsByShowtime[showtimeId] = [];
        }
      })
      .addCase(initializeSeatsForShowtime.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Track which showtime is being initialized
        state.currentShowtimeId = action.meta.arg;
      })
      .addCase(
        initializeSeatsForShowtime.fulfilled,
        (state, action: PayloadAction<Seat[]>) => {
          state.loading = false;
          // Store seats by showtime ID
          const showtimeId = state.currentShowtimeId;
          if (showtimeId) {
            state.seatsByShowtime[showtimeId] = action.payload;
          }
          // Keep the current showtime ID
        }
      )
      .addCase(initializeSeatsForShowtime.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Something went wrong initializing seats";
        // Clear seats for current showtime on error
        const showtimeId = state.currentShowtimeId;
        if (showtimeId) {
          state.seatsByShowtime[showtimeId] = [];
        }
        state.currentShowtimeId = null;
      })
      .addCase(
        updateSeatAvailability.fulfilled,
        (state, action: PayloadAction<Seat>) => {
          // Find and update the seat in the normalized structure
          const updatedSeat = action.payload;
          const showtimeId = updatedSeat.showtimeId;

          if (state.seatsByShowtime[showtimeId]) {
            const index = state.seatsByShowtime[showtimeId].findIndex(
              (seat) => seat.id === updatedSeat.id
            );
            if (index !== -1) {
              state.seatsByShowtime[showtimeId][index] = updatedSeat;
            }
          }
        }
      )
      .addCase(updateSeatAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSeatAvailability.rejected, () => {
        // Optionally set an error state or show a toast
      });
  },
});

export const { clearSeats } = seatsSlice.actions;

export default seatsSlice.reducer;
