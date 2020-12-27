import { renderHook, act } from '@testing-library/react-hooks';

import useGeoLocation from './index';

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
});

it('returns error when geolocation is not supported', () => {
  delete (global as any).navigator.permissions;
  delete (global as any).navigator.geolocation;

  const { result } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading, error, coords } = result.current;
  expect(loading).toEqual(false);
  expect(error).toEqual({ message: 'Geolocation not supported' });
  expect(coords).toBeUndefined();
});

it('returns current position when permissions is supported and permission is not present', async () => {
  (global as any).navigator.permissions = {
    query: jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ state: undefined })),
  };

  const { result, waitFor } = renderHook(() => useGeoLocation({ isEnabled: true }));
  
  const { loading: initialLoading, error: initialError, coords: initialCoords } = result.current;
  expect(initialLoading).toEqual(false);
  expect(initialError).toBeUndefined();
  expect(initialCoords).toBeUndefined();
  
  await waitFor(() => result.current.loading === true);
  
  const { loading: _loading, error: _error, coords: _coords } = result.current;
  expect(_loading).toEqual(true);
  expect(_error).toBeUndefined();
  expect(_coords).toBeUndefined();
  
  act(() => {
    jest.runAllTimers();
  });

  await waitFor(() => result.current.loading === false);

  const { loading, error, coords } = result.current;
  expect(loading).toEqual(false);
  expect(error).toBeUndefined();
  expect(coords).toEqual({ latitude: 51.1, longitude: 45.3 });
});

// it('returns current position when permissions is supported and permission is not granted', () => {

// });

it('returns undefined when permissions is supported and permission is already granted', async () => {
  (global as any).navigator.permissions = {
    query: jest.fn()
      .mockImplementationOnce(() => Promise.resolve({ state: 'granted' })),
  };

  const { result } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading, error, coords } = result.current;
  expect(loading).toEqual(false);
  expect(error).toBeUndefined();
  expect(coords).toBeUndefined();
});

it('returns current position when permissions is not supported and is-location-granted is not present in localStorage', async () => {
  delete (global as any).navigator.permissions;

  const { result, waitFor } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading: _loading, error: _error, coords: _coords } = result.current;
  expect(_loading).toEqual(true);
  expect(_error).toBeUndefined();
  expect(_coords).toBeUndefined();

  act(() => {
    jest.runAllTimers();
  });

  await waitFor(() => result.current.loading === false);

  const { loading, error, coords } = result.current;
  expect(error).toBeUndefined();
  expect(loading).toEqual(false);
  expect(coords).toEqual({ latitude: 51.1, longitude: 45.3 });
});

it('returns currrent position when permissions is not supported and is-location-granted is false in localStorage', async () => {
  delete (global as any).navigator.permissions;
  localStorage.setItem('is-location-granted', JSON.stringify(false));

  const { result, waitFor } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading: _loading, error: _error, coords: _coords } = result.current;
  expect(_loading).toEqual(true);
  expect(_error).toBeUndefined();
  expect(_coords).toBeUndefined();

  act(() => {
    jest.runAllTimers();
  });

  await waitFor(() => result.current.loading === false);

  const { loading, error, coords } = result.current;
  expect(error).toBeUndefined();
  expect(loading).toEqual(false);
  expect(coords).toEqual({ latitude: 51.1, longitude: 45.3 });
});

it('returns undefined when permissions is not supported and is-location-granted is true in localStorage', () => {
  delete (global as any).navigator.permissions;
  localStorage.setItem('is-location-granted', JSON.stringify(true));

  const { result } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading, error, coords } = result.current;
  expect(loading).toEqual(false);
  expect(error).toBeUndefined();
  expect(coords).toBeUndefined();
});

it('returns error when geolocation returns error', async () => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn()
      .mockImplementation((success, error) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(
              error({
                message: 'Geolocation error!'
              }),
            );
          }, 0);
        });
      }),
  };
  (global as any).navigator.geolocation = mockGeolocation;

  const { result, waitFor } = renderHook(() => useGeoLocation({ isEnabled: true }));

  const { loading: _loading, error: _error, coords: _coords } = result.current;
  expect(_loading).toEqual(true);
  expect(_error).toBeUndefined();
  expect(_coords).toBeUndefined();

  act(() => {
    jest.runAllTimers();
  });

  await waitFor(() => result.current.loading === false);

  const { loading, error, coords } = result.current;
  expect(loading).toEqual(false);
  expect(error).toEqual({ message: 'Geolocation error!' });
  expect(coords).toBeUndefined();
});
