import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import MoviesPage from "./pages/MoviesPage";
import ShowtimesPage from "./pages/ShowtimesPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import "./index.css";
import { Film, Popcorn, Projector } from "lucide-react";
import { Toaster } from 'sonner';


function App() {  
  
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <header className="bg-gradient-to-r from-pink-100 via-yellow-100 to-green-100 border-b-4 border-orange-400 shadow-lg">
            <div className="container mx-auto px-6 py-6 flex justify-between items-center">
              <h1 className="text-3xl font-extrabold text-green-700 drop-shadow-md">
                🎥 HOT Cinema
              </h1>
                <Projector color="orange" size={36} />
                <Popcorn color="gold" size={36} />
                <Film color="crimson" size={36} />
              <h1 className="text-3xl font-extrabold text-blue-600 drop-shadow-md">
                AT&T
              </h1>
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<MoviesPage />} />
              <Route
                path="/movie/:movieId/showtimes"
                element={<ShowtimesPage />}
              />
              <Route
                path="/booking/:showtimeId/seats"
                element={<SeatSelectionPage />}
              />
              <Route
                path="/booking/confirmation"
                element={<BookingConfirmationPage />}
              />
            </Routes>
          </main>
          
        </div>
        <Toaster richColors position="bottom-right" />
      </Router>
    </Provider>
  );
}

export default App;
