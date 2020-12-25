import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';

import useWeather from './index';
import { BASE_URL } from '../../config';
import * as utils from '../utils';

const data = [
  {
    location: { name: 'New York' },
    current: {
      temperature: 15,
      precip: 0,
      humidity: 80,
      wind_speed: 6,
      wind_dir: 'N',
      wind_degree: 140,
      cloudcover: 20,
      uv_index: 6,
      pressure: 1011,
    },
  },
  {
    location: { name: 'Tokyo' },
    current: {
      temperature: 12,
      precip: 5,
      humidity: 20,
      wind_speed: 6,
      wind_dir: 'NE',
      wind_degree: 20,
      cloudcover: 40,
      uv_index: 2,
      pressure: 1017,
    },
  },
];

const server = setupServer(
  rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
    const q = req.url.searchParams.get('query')!;
    return res(
      ctx.status(200),
      ctx.json(data.find(city => city.location.name.toLowerCase() === q)),
    );
  }),
  rest.get('*', (req, res, ctx) => {
    const error = `Please add request handler for ${req.url.toString()}`;
    console.error(error);
    return res(
      ctx.status(500),
      ctx.json({ error }),
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
afterAll(() => server.close());

const wrapper = ({ children } : { children: ReactNode }) => {
    const queryClient = new QueryClient();
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
};

it('should set cityName as q in swr call when single cityName is passed', () => {
  const cityNames = ['tokyo'];
  jest.spyOn(utils, 'fetcher');
  renderHook(() => useWeather({ cityNames }), { wrapper });
  expect(utils.fetcher).toHaveBeenCalledTimes(1);
});

it('should set cityName as q in swr call when multiple cityNames are passed', () => {
  const cityNames = ['tokyo', 'shanghai'];
  jest.spyOn(utils, 'fetcher');
  renderHook(() => useWeather({ cityNames }), { wrapper });
  expect(utils.fetcher).toHaveBeenCalledTimes(2);
});

it('should transform received data correctly when single city is passed in', async () => {
  const cityNames = ['new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityNames }), { wrapper });

  const { weatherCollection: _weatherCollection } = result.current;
  expect(_weatherCollection).toEqual([]);

  await waitForNextUpdate();

  const { weatherCollection } = result.current;
  const transformedWeather = [{
    name: cityNames[0],
    title: data[0].location.name,
    temperature: data[0].current.temperature,
    precipitation: data[0].current.precip,
    humidity: data[0].current.humidity,
    windSpeed: data[0].current.wind_speed,
    windDirection: data[0].current.wind_dir,
    windDegree: data[0].current.wind_degree,
    cloudCover: data[0].current.cloudcover,
    uvIndex: data[0].current.uv_index,
    pressure: data[0].current.pressure,
  }];
  expect(weatherCollection).toEqual(transformedWeather);
});

it('should transform received data correctly when multiple cities are passed', async () => {
  const cityNames = ['new york', 'tokyo'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection } = result.current;
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection } = result.current;
  
  const transformedWeather = data.map((item, index) => ({
    name: cityNames[index],
    title: item.location.name,
    temperature: item.current.temperature,
    precipitation: item.current.precip,
    humidity: item.current.humidity,
    windSpeed: item.current.wind_speed,
    windDirection: item.current.wind_dir,
    windDegree: item.current.wind_degree,
    cloudCover: item.current.cloudcover,
    uvIndex: item.current.uv_index,
    pressure: item.current.pressure,
  }));
  expect(weatherCollection).toEqual(transformedWeather);
});

it('should handle 200 with embedded error correctly when single city is passed', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            code: 612,
            info: 'No data found for specified city',
          }
        }),
      );
    }),
  );

  const cityNames = ['tokyo'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: 'No data found for specified city' })
  expect(weatherCollection).toEqual([]);
});

it('should handle 200 with embedded error correctly when multiple cities are passed in', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            code: 612,
            info: 'No data found for specified city',
          }
        }),
      );
    }),
  );

  const cityNames = ['tokyo', 'new york'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: 'No data found for specified city' })
  expect(weatherCollection).toEqual([]);
});

it('should handle 4xx correctly when single city is passed as array', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(422),
        ctx.json({
          message: '422 error',
        }),
      );
    }),
  );

  const cityNames = ['tokyo'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: '422 error' });
  expect(weatherCollection).toEqual([]);
});

it('should handle 4xx correctly when multiple cities are passed in', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(422),
        ctx.json({
          message: '422 error',
        }),
      );
    }),
  );

  const cityNames = ['tokyo', 'new york'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: '422 error' });
  expect(weatherCollection).toEqual([]);
});

it('should handle 5xx correctly when single city is passed as array', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(500),
        ctx.json({
          message: 'Unhandled server error',
        }),
      );
    }),
  );

  const cityNames = ['tokyo'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: 'Unhandled server error' });
  expect(weatherCollection).toEqual([]);
});

it('should handle 5xx correctly when multiple cities are passed in', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(500),
        ctx.json({
          message: 'Unhandled server error',
        }),
      );
    }),
  );

  const cityNames = ['tokyo', 'new york'];
  const { result, waitFor } = renderHook(() => useWeather({ cityNames }), { wrapper });
  
  const { weatherCollection: _weatherCollection, error: _error } = result.current;
  expect(_error).toBeUndefined()
  expect(_weatherCollection).toEqual([]);

  await waitFor(() => result.current.isLoading === false);

  const { weatherCollection, error } = result.current;
  expect(error).toMatchObject({ message: 'Unhandled server error' });
  expect(weatherCollection).toEqual([]);
});
