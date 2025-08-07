import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Add TextEncoder/TextDecoder polyfill for Node.js environment  
if (typeof global.TextEncoder === 'undefined') {
  // Simple polyfill for TextEncoder/TextDecoder
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextEncoder = class {
    encode(str: string): Uint8Array {
      const buf = Buffer.from(str, 'utf8');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).TextDecoder = class {
    decode(bytes: Uint8Array): string {
      return Buffer.from(bytes).toString('utf8');
    }
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL for React Router
if (typeof global.URL?.createObjectURL === 'undefined') {
  Object.defineProperty(global.URL, 'createObjectURL', {
    value: jest.fn(() => 'mocked-url'),
  });
}
