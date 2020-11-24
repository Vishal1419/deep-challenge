import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import * as SWR from 'swr';

import useCity, { SortType } from './index';
import { BASE_URL } from '../../config';
import { fetcher } from '../../shared/utils';

const data = {
  records: [
    { fields: { city: 'new york', accentcity: 'New York' } },
    { fields: { city: 'tokyo', accentcity: 'Tokyo' } },
  ],
};

const server = setupServer(
  rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(data),
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
  params: {
    start?: number;
    rows: number;
    query?: string;
    sort?: SortType;
    exclude?: string[];
  },
  urlSuffix: string
) => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );
  
  jest.spyOn(SWR, 'default');
  renderHook(() => useCity(params), { wrapper });

  expect(SWR.default).toHaveBeenCalledWith(
    `${BASE_URL.CITIES_SERVICE}?dataset=worldcitiespop&facet=city&${urlSuffix}`,
    expect.any(Object),
  );
};

it('should set default value of start parameter to 0', () => {
  const params = {
    rows: 2,
  }
  const suffix = `start=0&rows=${params.rows}`;
  swrHelper(params, suffix);
});

it('should not set any default value for query, sort and exclude', () => {
  const params = {
    rows: 2,
  }
  const suffix = `start=0&rows=${params.rows}`;
  swrHelper(params, suffix);
});

it('should set start parameter of suffix to the passed in value', () => {
  const params = {
    start: 2,
    rows: 2,
  };
  const suffix = `start=${params.rows}&rows=${params.rows}`;
  swrHelper(params, suffix);
});

it('should set rows parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
  };
  const suffix = `start=0&rows=${params.rows}`;
  swrHelper(params, suffix);
});

it('should set query parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    query: 'test',
  };
  const suffix = `start=0&rows=${params.rows}&q=${params.query}`;
  swrHelper(params, suffix);
});

it('should set sort parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    sort: 'population' as SortType,
  };
  const suffix = `start=0&rows=${params.rows}&sort=${params.sort}`;
  swrHelper(params, suffix);
});

it('should set exclude parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    exclude: ['test1', 'test2'],
  };
  const excludedCities = params.exclude.map(city => `exclude.city=${city}`);
  const suffix = `start=0&rows=${params.rows}&${excludedCities.join('&')}`;
  swrHelper(params, suffix);
});

it('should set all the provided parameters', () => {
  const params = {
    start: 3,
    rows: 4,
    query: 'test',
    sort: 'population' as SortType,
    exclude: ['test1', 'test2'],
  };
  const excludedCities = params.exclude.map(city => `exclude.city=${city}`);
  const suffix = `start=${params.start}&rows=${params.rows}&q=${params.query}&sort=${params.sort}&${excludedCities.join('&')}`;
  swrHelper(params, suffix);
});

it('should transform received data correctly', async () => {
  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, loading, error } = result.current;
  const transformedCities = data.records
  .map(record => ({
    name: record.fields.city,
    title: record.fields.accentcity,
  }));
  expect(loading).toBeFalsy();
  expect(error).toBeUndefined()
  expect(cities).toEqual(transformedCities);
});

it('should handle 200 with embedded error correctly', async () => {
  server.use(
    rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          error: {
            message: 'Some embedded error',
          },
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Some embedded error' });
  expect(cities).toHaveLength(0);
});

it('should handle 4xx correctly', async () => {
  server.use(
    rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          message: 'No cities found',
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined();
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'No cities found' });
  expect(cities).toHaveLength(0);
});

it('should handle 5xx correctly', async () => {
  server.use(
    rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({
          message: 'Server error',
        }),
      );
    }),
  );

  const wrapper = ({ children } : { children: ReactNode }) => (
    <SWR.SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      {children}
    </SWR.SWRConfig>
  );

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, loading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeUndefined()
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, loading, error } = result.current;
  expect(loading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Server error' });
  expect(cities).toHaveLength(0);
});
