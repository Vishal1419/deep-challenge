import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig, cache } from 'swr';
import { BrowserRouter } from 'react-router-dom';
import Dialog from 'react-modal';
import '@testing-library/jest-dom/extend-expect'

import WeatherInfo from '../WeatherInfo';
import { PAGE_SIZE } from '../Home/Home';
import * as notificationHelpers from '../../shared/notifier';
import { BASE_URL } from '../../config';
import { fetcher, compareCityNames } from '../../shared/utils';
import { Weather } from '../../shared/interfaces';

let data = {
  location: { name: 'Tokyo' },
  current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
};

let expectedData: Weather;

const server = setupServer(
  rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
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
  cache.clear();
});
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
  cache.clear();
});
afterAll(() => server.close());

const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route)

  return render(ui, { wrapper: BrowserRouter })
}

it('should show a loader initially', () => {
  renderWithRouter(
    <SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      <WeatherInfo />
    </SWRConfig>,
    { route: '/tokyo' }
  );
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
});

it('should hide the loader after data is fetched', async () => {
  renderWithRouter(
    <SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      <WeatherInfo />
    </SWRConfig>,
    { route: '/tokyo' }
  );
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  })
});
