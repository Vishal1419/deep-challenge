// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

(global as any).localStorage = localStorageMock;

const mockGeolocation = {
  getCurrentPosition: jest.fn()
    .mockImplementation((success) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(
            success({
              coords: {
                latitude: 51.1,
                longitude: 45.3
              },
            }),
          );
        }, 0);
      });
    }),
};

beforeEach(() => {
  (global as any).navigator.geolocation = mockGeolocation;
  (global as any).GeolocationPositionError = jest.fn();
  localStorage.clear()
});
