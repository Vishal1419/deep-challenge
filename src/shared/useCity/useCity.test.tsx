import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';

import useCity, { SortType } from './index';
import { BASE_URL } from '../../config';
import * as utils from '../utils';

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

const useQueryHelper = (
  params: {
    start?: number;
    rows: number;
    query?: string;
    sort?: SortType;
    exclude?: string[];
  },
  urlSuffix: string
) => {
  jest.spyOn(utils, 'fetcher');
  renderHook(() => useCity(params), { wrapper });

  expect(utils.fetcher).toHaveBeenCalledWith(
    `${BASE_URL.CITIES_SERVICE}?dataset=worldcitiespop&facet=city&${urlSuffix}`,
  );
};

it('should not set any default value for query, sort and exclude', () => {
  const params = {
    rows: 2,
  }
  const suffix = `rows=${params.rows}`;
  useQueryHelper(params, suffix);
});

it('should set rows parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
  };
  const suffix = `rows=${params.rows}`;
  useQueryHelper(params, suffix);
});

it('should set query parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    query: 'test',
  };
  const suffix = `rows=${params.rows}&q=${params.query}`;
  useQueryHelper(params, suffix);
});

it('should set sort parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    sort: 'population' as SortType,
  };
  const suffix = `rows=${params.rows}&sort=${params.sort}`;
  useQueryHelper(params, suffix);
});

it('should set exclude parameter of suffix to the passed in value', () => {
  const params = {
    rows: 4,
    exclude: ['test1', 'test2'],
  };
  const excludedCities = params.exclude.map(city => `exclude.city=${city}`);
  const suffix = `rows=${params.rows}&${excludedCities.join('&')}`;
  useQueryHelper(params, suffix);
});

it('should set all the provided parameters', () => {
  const params = {
    rows: 4,
    query: 'test',
    sort: 'population' as SortType,
    exclude: ['test1', 'test2'],
  };
  const excludedCities = params.exclude.map(city => `exclude.city=${city}`);
  const suffix = `rows=${params.rows}&q=${params.query}&sort=${params.sort}&${excludedCities.join('&')}`;
  useQueryHelper(params, suffix);
});

it('should transform received data correctly', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, isLoading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeNull()
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, isLoading, error } = result.current;
  const transformedCities = data.records
  .map(record => ({
    name: record.fields.city,
    title: record.fields.accentcity,
  }));
  expect(isLoading).toBeFalsy();
  expect(error).toBeNull()
  expect(cities).toEqual(transformedCities);
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

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, isLoading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeNull();
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, isLoading, error } = result.current;
  expect(isLoading).toBeFalsy();
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

  const { result, waitForNextUpdate } = renderHook(() => useCity({ rows: 2 }), { wrapper });
  const { cities: _cities, isLoading: _loading, error: _error } = result.current;
  expect(_loading).toBeTruthy();
  expect(_error).toBeNull()
  expect(_cities).toHaveLength(0);
  
  await waitForNextUpdate();
  
  const { cities, isLoading, error } = result.current;
  expect(isLoading).toBeFalsy();
  expect(error).toMatchObject({ message: 'Server error' });
  expect(cities).toHaveLength(0);
});
