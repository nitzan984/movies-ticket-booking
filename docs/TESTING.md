# Testing Setup for Movie Ticket Booking System

## Overview

This project uses **Jest** and **React Testing Library** for comprehensive testing of React components, Redux state management, and utility functions.

## Testing Stack

- **Jest**: JavaScript testing framework
- **React Testing Library**: Testing utilities for React components
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements

## Configuration Files

- `jest.config.js`: Main Jest configuration
- `tsconfig.test.json`: TypeScript configuration for tests
- `src/test/setupTests.ts`: Test environment setup
- `src/test/__mocks__/fileMock.js`: Mock for static assets

## Test Scripts

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:ui
```

## Test Categories

### 1. Component Tests
- **Location**: `src/components/__tests__/`
- **Purpose**: Test React component rendering, props, and user interactions
- **Example**: `MovieCard.test.tsx`

### 2. Page Tests
- **Location**: `src/pages/__tests__/`
- **Purpose**: Integration tests for full page components with routing and state
- **Example**: `MoviesPage.test.tsx`

### 3. Redux Tests
- **Location**: `src/store/slices/__tests__/`
- **Purpose**: Test Redux slice reducers, actions, and async thunks
- **Example**: `moviesSlice.test.ts`

### 4. Utility Tests
- **Location**: `src/lib/__tests__/`
- **Purpose**: Test utility functions and helpers
- **Example**: `utils.test.ts`

## Test Patterns

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

test('renders component correctly', () => {
  renderWithRouter(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Redux Testing
```typescript
import { configureStore } from '@reduxjs/toolkit';
import reducer, { actionCreator } from '../slice';

test('should handle action', () => {
  const store = configureStore({ reducer: { slice: reducer } });
  store.dispatch(actionCreator(payload));
  const state = store.getState().slice;
  expect(state.property).toEqual(expectedValue);
});
```

### Integration Testing
```typescript
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

const renderWithProviders = (component, initialState = {}) => {
  const store = configureStore({
    reducer: { /* your reducers */ },
    preloadedState: initialState,
  });
  return render(<Provider store={store}>{component}</Provider>);
};
```

## Mocks and Polyfills

The test environment includes mocks for:
- `window.matchMedia` (for responsive design tests)
- `ResizeObserver` (for component resize detection)
- `IntersectionObserver` (for visibility detection)
- Static assets (images, CSS files)
- Fetch API (for API calls)

## Coverage Thresholds

The project maintains minimum coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main` branch
- Pushes to `main` and `develop` branches
- Coverage reports are uploaded to Codecov

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use descriptive test names**
3. **Keep tests focused and atomic**
4. **Mock external dependencies**
5. **Test error states and edge cases**
6. **Maintain good test coverage**

## Common Commands

```bash
# Run specific test file
npx jest path/to/test.ts

# Run tests matching pattern
npx jest --testNamePattern="should handle"

# Update snapshots
npx jest --updateSnapshot

# Debug failing tests
npx jest --verbose
```
