# Movie Ticket Booking System

A modern, responsive React-b## Available Scripts

-   `npm run dev` - Start development server
-   `npm run build` - Build for production
-   `npm run preview## Testing

The project includes comprehensive unit and integration tests for critical components and functionality:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:ui
```

### Test Structure
Tests are organized in `__tests__` directories alongside the source code:

```
src/
├── components/__tests__/
│   ├── MovieCard.test.tsx        # Movie display component tests
│   ├── MovieFilters.test.tsx     # Search and filter tests (8 tests)
│   ├── SeatMap.test.tsx          # Interactive seat selection tests (16 tests)
│   └── ShowtimeCard.test.tsx     # Showtime display tests (18 tests)
├── lib/__tests__/
│   └── utils.test.ts             # Utility function tests
├── pages/__tests__/
│   └── MoviesPage.test.tsx       # Page component tests
└── store/slices/__tests__/
    └── moviesSlice.test.ts       # Redux slice tests
```

### Testing Highlights
- **Real Redux Integration**: Tests use actual Redux stores instead of mocks for accurate state testing
- **User-Centric Testing**: Focus on user interactions and expected behaviors
- **Comprehensive Coverage**: Tests cover rendering, user interactions, state management, and edge cases
- **Error Handling**: Tests include validation, error states, and loading scenarios
- **Cross-Component Integration**: Tests verify component communication through Reduxction build
-   `npm run test` - Run tests
-   `npm run test:watch` - Run tests in watch mode
-   `npm run test:coverage` - Run tests with coverage report
-   `npm run test:ui` - Run tests with verbose output
-   `npm run lint` - Run ESLint
-   `npm run start:api` - Start the mock JSON API servertend for a movie ticket booking system built with TypeScript, Redux, and Tailwind CSS.

## Features

-   **Movie Listings**: Browse movies with filtering by genre and rating
-   **Search Functionality**: Search movies by title
-   **Showtime Display**: View available showtimes for selected movies
-   **Interactive Seat Selection**: Visual seat map with different seat types
-   **Booking Management**: Complete booking flow with confirmation
-   **Responsive Design**: Optimized for desktop and mobile devices
-   **State Management**: Redux for efficient state handling
-   **Type Safety**: Full TypeScript implementation

## Tech Stack

-   **Frontend Framework**: React 18 with TypeScript
-   **Build Tool**: Vite
-   **State Management**: Redux Toolkit
-   **Styling**: Tailwind CSS v3
-   **UI Components**: shadcn/ui
-   **Routing**: React Router v6
-   **Testing**: Jest 30.0.5 and React Testing Library 16.3.0
-   **Test Environment**: jsdom with comprehensive polyfills
-   **Icons**: Lucide React
-   **Mock API**: json-server

## Prerequisites

-   Node.js (version 16 or higher)
-   npm 

## Installation & Setup

1.  **Clone the repository**
    \`\`\`bash
    git clone <repository-url>
    cd movie-ticket-booking-system
    \`\`\`

2.  **Install dependencies**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Start the mock API server**
    \`\`\`bash
    npm run start:api
    \`\`\`
    This will start the API server on \`http://localhost:3001\`.

4.  **Start the development server**
    \`\`\`bash
    npm run dev
    \`\`\`

5.  **Open your browser**
    Navigate to \`http://localhost:5173\`

## Available Scripts

-   \`npm run dev\` - Start development server
-   \`npm run build\` - Build for production
-   \`npm run preview\` - Preview production build
-   \`npm run test\` - Run tests
-   \`npm run test:watch\` - Run tests in watch mode
-   \`npm run lint\` - Run ESLint
-   \`npm run start:api\` - Start the mock JSON API server


## Testing Strategy

The project includes comprehensive unit and integration tests built with **Jest** and **React Testing Library**. Our testing approach focuses on:

### Test Coverage
- **Component Tests**: All major UI components (MovieCard, MovieFilters, SeatMap, ShowtimeCard)
- **Redux Integration Tests**: State management with real Redux stores (no mocking)
- **Utility Function Tests**: Core business logic and helper functions
- **User Interaction Tests**: Click events, form inputs, and navigation flows

### Key Test Features
- **Real Redux Testing**: Tests use actual Redux stores for accurate state testing
- **Comprehensive Component Coverage**: 
  - MovieFilters: 8 tests (search, filtering, state management)
  - SeatMap: 16 tests (seat selection, pricing, visual feedback)
  - ShowtimeCard: 18 tests (display, interactions, Redux integration)
- **Edge Case Handling**: Sold out scenarios, different data formats, error states
- **Responsive Design Testing**: CSS class verification and layout testing

### Current Test Statistics
- **Total Tests**: 56+ comprehensive test cases
- **Component Coverage**: 90%+ on tested components
- **Test Suite**: MovieFilters, SeatMap, ShowtimeCard, utils, and Redux slices
- **Testing Libraries**: Jest 30.0.5, React Testing Library 16.3.0, @testing-library/jest-dom 6.6.4
\`\`\`

## Features Overview

### Movie Listings
-   Display movies with poster, title, genre, rating, and duration
-   Filter by multiple genres and ratings
-   Search functionality by movie title
-   Responsive grid layout

### Showtime Management
-   View available showtimes for selected movies
-   Display theater information and seat availability
-   Show pricing information
-   Handle sold-out scenarios

### Seat Selection
-   Interactive seat map with visual feedback
-   Different seat types (Regular, Premium, VIP) with different pricing
-   Real-time selection updates
-   Booking summary with total calculation
-   **Seat data fetched from API**

### Booking Flow
-   Complete booking process from movie selection to confirmation
-   State persistence across navigation
-   Input validation and error handling
-   Confirmation page with booking details

## Mock API Configuration

The application now uses \`json-server\` to serve mock data from \`db.json\`.

-   **\`db.json\`**: Contains static data for \`movies\`, \`theaters\`, \`showtimes\`, and **\`seats\`**.
-   **API Endpoints**:
    -   \`http://localhost:3001/movies\`
    -   \`http://localhost:3001/theaters\`
    -   \`http://localhost:3001/showtimes\`
    -   \`http://localhost:3001/showtimes?movieId=<id>\` (to filter showtimes by movie)
    -   **\`http://localhost:3001/seats?showtimeId=<id>\` (to fetch seats for a specific showtime)**

## State Management

The application uses Redux Toolkit for state management with three main slices:

### Movies Slice
-   Manages movie data and filtering
-   Handles search queries and filter states
-   Fetches movie data from the \`json-server\` API

### Booking Slice
-   Manages the booking flow state
-   Handles seat selection and pricing
-   Maintains selected movie and showtime information

### Seats Slice
-   **Manages the availability and details of all seats for a given showtime.**
-   Fetches seat data from the \`json-server\` API.

## Testing

The project includes unit tests for critical components:

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
\`\`\`

Test files are located in \`src/__tests__/\` and cover:
-   Component rendering
-   User interactions
-   State management
-   Error handling

## Responsive Design

The application is fully responsive with:
-   Mobile-first approach
-   Flexible grid layouts
-   Touch-friendly interactions
-   Optimized navigation for small screens

## Error Handling

Comprehensive error handling includes:
-   Input validation for search and filters
-   Graceful handling of missing data
-   User-friendly error messages
-   Loading states for better UX

## Performance Optimizations

-   Efficient Redux state updates
-   Memoized components where appropriate
-   Optimized re-renders
-   Lazy loading considerations

## Quality Assurance

### Code Quality
-   **TypeScript**: Full type safety throughout the application
-   **ESLint**: Comprehensive linting rules for code consistency
-   **Testing**: 56+ test cases with Jest and React Testing Library
-   **Coverage**: High test coverage on critical components and business logic

### Testing Standards
-   Unit tests for all major components
-   Integration tests for Redux state management
-   User interaction testing with React Testing Library
-   Edge case and error scenario coverage

### Development Guidelines
-   Follow TypeScript best practices
-   Write tests for new components and features
-   Use real Redux stores in tests (avoid mocking when possible)
-   Follow the existing project structure and naming conventions

## License

This project is licensed under the MIT License.
