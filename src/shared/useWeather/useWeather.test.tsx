import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as SWR from 'swr';

import useWeather from './index';
import { BASE_URL, WEATHER_STACK_API_KEY } from '../../config';
import { fetcher } from '../../shared/utils';

const data = [
  {
    location: { name: 'New York' },
    current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'Tokyo' },
    current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
];

const server = setupServer(
  rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
    const q = req.url.searchParams.get('query')!;
    const query = q.split(';');
    return res(
      ctx.status(200),
      ctx.json(query.length > 1 ? data : data[0]),
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
beforeEach(() => {
  SWR.cache.clear();
});
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
  SWR.cache.clear();
});
afterAll(() => server.close());

const swrHelper = (
  cityName: string | string[],
  urlSuffix: string,
) => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );
  
  jest.spyOn(SWR, 'default');
  renderHook(() => useWeather({ cityName }), { wrapper });

  expect(SWR.default).toHaveBeenCalledWith(
    `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&${urlSuffix}`,
    expect.any(Object),
  );
};

it('should set cityName as q in swr call when single cityName is passed as string', () => {
  const cityName = 'tokyo';
  const suffix = `query=${cityName}`;
  swrHelper(cityName, suffix);
});

it('should set cityName as q in swr call when single cityName is passed as string[]', () => {
  const cityName = ['tokyo'];
  const cities = cityName.join(';');
  const suffix = `query=${cities}`;
  swrHelper(cityName, suffix);
});

it('should set cityName as q in swr call when multiple cityName are passed', () => {
  const cityName = ['tokyo'];
  const cities = cityName.join(';');
  const suffix = `query=${cities}`;
  swrHelper(cityName, suffix);
});

it('should transform received data correctly when single city is passed as string', async () => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = 'new york';
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });

  const { weather: _weather } = result.current;
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather } = result.current;
  const transformedWeather = {
    title: data[0].location.name,
    temperature: data[0].current.temperature,
    precipitation: data[0].current.precip,
    humidity: data[0].current.humidity,
    windSpeed: data[0].current.wind_speed,
    imageSource: data[0].current.weather_icons[0],
  };
  expect(weather).toEqual(transformedWeather);
});

it('should transform received data correctly when single city is passed as array', async () => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });

  const { weather: _weather } = result.current;
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather } = result.current;
  const transformedWeather = {
    title: data[0].location.name,
    temperature: data[0].current.temperature,
    precipitation: data[0].current.precip,
    humidity: data[0].current.humidity,
    windSpeed: data[0].current.wind_speed,
    imageSource: data[0].current.weather_icons[0],
  };
  expect(weather).toEqual(transformedWeather);
});

it('should transform received data correctly when multiple cities are passed', async () => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['new york', 'tokyo'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weatherCollection: _weatherCollection } = result.current;
  expect(_weatherCollection).toBeUndefined();

  await waitForNextUpdate();

  const { weatherCollection } = result.current;
  const transformedWeather = data.map(item => ({
    title: item.location.name,
    temperature: item.current.temperature,
    precipitation: item.current.precip,
    humidity: item.current.humidity,
    windSpeed: item.current.wind_speed,
    imageSource: item.current.weather_icons[0],
  }));
  expect(weatherCollection).toEqual(transformedWeather);
});

it('should handle 200 with embedded error correctly when single city is passed as string', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = 'tokyo';
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'No data found for specified city' })
  expect(weather).toBeUndefined();
});

it('should handle 200 with embedded error correctly when single city is passed as array', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'No data found for specified city' })
  expect(weather).toBeUndefined();
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo', 'new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weatherCollection: _weatherCollection, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weatherCollection).toBeUndefined();

  await waitForNextUpdate();

  const { weatherCollection, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'No data found for specified city' })
  expect(weatherCollection).toBeUndefined();
});

it('should transform 200 with embedded error 615 correctly when single city is passed as string', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            code: 615,
            info: 'No data found for specified city',
          }
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = 'tokyo';
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Weather info for this city is not available' })
  expect(weather).toBeUndefined();
});

it('should transform 200 with embedded error 615 correctly when single city is passed as array', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            code: 615,
            info: 'No data found for specified city',
          }
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Weather info for this city is not available' })
  expect(weather).toBeUndefined();
});

it('should transform 200 with embedded error 615 correctly when multiple cities are passed in', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            code: 615,
            info: 'No data found for specified city',
          }
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo', 'new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weatherCollection: _weatherCollection, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weatherCollection).toBeUndefined();

  await waitForNextUpdate();

  const { weatherCollection, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Weather info for this city is not available' })
  expect(weatherCollection).toBeUndefined();
});

it('should handle 4xx correctly when single city is passed as string', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = 'tokyo';
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: '422 error' })
  expect(weather).toBeUndefined();
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: '422 error' })
  expect(weather).toBeUndefined();
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo', 'new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weatherCollection: _weatherCollection, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weatherCollection).toBeUndefined();

  await waitForNextUpdate();

  const { weatherCollection, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: '422 error' })
  expect(weatherCollection).toBeUndefined();
});

it('should handle 5xx correctly when single city is passed as string', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = 'tokyo';
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Unhandled server error' })
  expect(weather).toBeUndefined();
});

it('should handle 4xx correctly when single city is passed as array', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weather: _weather, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_weather).toBeUndefined();

  await waitForNextUpdate();

  const { weather, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Unhandled server error' })
  expect(weather).toBeUndefined();
});

it('should handle 4xx correctly when multiple cities are passed in', async () => {
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

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const cityName = ['tokyo', 'new york'];
  const { result, waitForNextUpdate } = renderHook(() => useWeather({ cityName }), { wrapper });
  
  const { weatherCollection: _weatherCollection, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_weatherCollection).toBeUndefined();

  await waitForNextUpdate();

  const { weatherCollection, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Unhandled server error' })
  expect(weatherCollection).toBeUndefined();
});
