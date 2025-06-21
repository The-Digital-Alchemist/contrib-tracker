import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global test setup
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables for tests
vi.mock('import.meta.env', () => ({
  VITE_GITHUB_TOKEN: 'test-token'
})); 