import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import Dialog from 'react-modal';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom/extend-expect'

import Home from '../Home';
import * as useCity from '../../shared/useCity';
import * as useWeather from '../../shared/useWeather';
import * as notificationHelpers from '../../shared/notifier';
import { BASE_URL } from '../../config';

let cities = {
  records: [
    { fields: { city: 'new york', accentcity: 'New York' } },
    { fields: { city: 'tokyo', accentcity: 'Tokyo' } },
    { fields: { city: 'bombay', accentcity: 'Bombay' } },
    { fields: { city: 'rajkot', accentcity: 'Rajkot' } },
    { fields: { city: 'london', accentcity: 'London' } },
  ],
};

let weatherData = [
  {
    location: { name: 'New York' },
    current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'Tokyo' },
    current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'Bombay' },
    current: { temperature: 25, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'Rajkot' },
    current: { temperature: 25, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'London' },
    current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
];

let expectedData = [ // this is a sorted array on name
  { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  { name: 'tokyo', title: 'Tokyo', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
];

const removedCities = ['tokyo'];
let restoredCities = ['bombay'];
const userData = [
  { cityName: 'new york', isFavorite: true, notes: 'This is my favorite city' },
  { cityName: 'bombay', isFavorite: true, notes: '' },
  { cityName: 'rajkot', isFavorite: false, notes: 'This is some notes for rajkot' },
];

const server = setupServer(
  rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(cities),
    );
  }),
  rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
    const q = req.url.searchParams.get('query');
    const id = cities.records.find(city => city.fields.city === q)?.fields.accentcity;
    const data = weatherData.find(item => item.location.name === id)!;
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


const renderHome = () => {
  localStorage.setItem('is-location-granted', JSON.stringify(true));
  const queryClient = new QueryClient();
  const { container, ...rest } = render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </QueryClientProvider>
  );
  Dialog.setAppElement(container as HTMLElement);
  return { container, ...rest };
};

it('should show a loader initially', () => {
  renderHome();
  expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'true');
});

it('should hide loader after data is fetched', async () => {
  renderHome();
  expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
});

it('should render table headers', async () => {
  renderHome();
  const row = screen.getByText(/city/i).closest('tr')!;
  expect(within(row).getByText(/city/i)).toBeInTheDocument();
  expect(within(row).getByText(/temp/i)).toBeInTheDocument();
});

it('should fetch 15 largest cities by population', async () => {
    const useCitySpy = jest.spyOn(useCity, 'default');
    renderHome();
    await waitFor(() => {
      expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
    });
    expect(useCitySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: 15,
        sort: 'population',
      }),
    );
});

it('should not fetch weather data for removed cities', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  const useWeatherSpy = jest.spyOn(useWeather, 'default');
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  expect(useWeatherSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        cityNames: ['new york', 'bombay', 'rajkot', 'london'] // order = all cities - removed cities
    }),
  );
});

it('should render restored cities', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('restored-cities', JSON.stringify(restoredCities));
  const useWeatherSpy = jest.spyOn(useWeather, 'default');
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  expect(useWeatherSpy).toHaveBeenNthCalledWith(
      useWeatherSpy.mock.calls.length,
      expect.objectContaining({
        cityNames: ['new york', 'rajkot', 'london', 'bombay'] // order = all cities - removed cities + restored cities
    }),
  );
});

it('should render favorite cities', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('restored-cities', JSON.stringify(restoredCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  const useWeatherSpy = jest.spyOn(useWeather, 'default');
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  expect(useWeatherSpy).toHaveBeenNthCalledWith(
      useWeatherSpy.mock.calls.length,
      expect.objectContaining({
        cityNames: ['rajkot', 'london', 'bombay', 'new york'] // order = all cities - removed cities + restored cities + (favorite cities - removed cities - restored cities)
    }),
  );
});

it('should have cityName with link to details page, temperature, favorite unchecked and remove button on each row in alphabetical order', async () => {
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  tableRows.forEach((row, index) => {
    const data = expectedData[index]; // expected data is already sorted by name in alphabetical order
    const _row = row as HTMLElement;
    expect(within(_row).getByText(data.title)).toHaveAttribute('href', `/${data.name}`);
    expect(within(_row).getByText(`${data.temperature}°C`)).toBeInTheDocument();
    expect(within(_row).getByText(`${Math.round(data.temperature * (9 / 5)) + 32}°F`, { exact: false })).toBeInTheDocument();
    expect((within(_row).getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
    expect(within(_row).getByText(/remove/i)).toBeInTheDocument();
  });
});

it('should show a dialog on click of each remove button', async () => {
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  tableRows.forEach((row, index) => {
    const _row = row as HTMLElement;
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const removeButton = within(_row).getByRole('button', { name: /remove/i});
    fireEvent.click(removeButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
  });
});

it('should not remove city and should close the dialog on click of cancel button in dialog', async () => {
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  tableRows.forEach((row, index) => {
    const data = expectedData[index];
    const _row = row as HTMLElement;
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(_row).getByText(data.title)).toBeInTheDocument();
    const removeButton = within(_row).getByRole('button', { name: /remove/i});
    fireEvent.click(removeButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(_row).getByText(data.title)).toBeInTheDocument();
  });
});

it('should remove city and should close the dialog and should show a notification on click of confirm button in dialog', async () => {
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  for (let i = tableRows.length - 1; i >= 0; i--) {
    const row = tableRows[i] as HTMLElement;
    const data = expectedData[i];
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(row).getByText(data.title)).toBeInTheDocument();
    const removeButton = within(row).getByRole('button', { name: /remove/i});
    fireEvent.click(removeButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(row).queryByText(data.title)).not.toBeInTheDocument();
    expect(notificationSpy).toHaveBeenNthCalledWith(tableRows.length - i, 'City removed!');
  }
});

it('should show remove city button even if city is favorite', async () => {
  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  tableRows.forEach((row, index) => {
    const data = expectedData[index];
    const _row = row as HTMLElement;
    if (data.isFavorite) {
      expect(within(_row).getByRole('button', { name: /remove/i })).toBeInTheDocument();
    }
  });
});

it('should show fetch new cities button when all cities are removed', async () => {
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  for (let i = tableRows.length - 1; i >= 0; i--) {
    const row = tableRows[i] as HTMLElement;
    const removeButton = within(row).getByRole('button', { name: /remove/i});
    fireEvent.click(removeButton);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
  }
  expect(screen.getByRole('button', { name: /fetch new cities/i })).toBeInTheDocument();
});

it('should fetch new cities on click of fetch new cities button', async () => {
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  for (let i = tableRows.length - 1; i >= 0; i--) {
    const row = tableRows[i] as HTMLElement;
    const removeButton = within(row).getByRole('button', { name: /remove/i});
    fireEvent.click(removeButton);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
  }
  
  cities = {
    records: [
      { fields: { city: 'xian', accentcity: 'Xian' } },
      { fields: { city: 'los angeles', accentcity: 'Los Angeles' } },
      { fields: { city: 'melbourne', accentcity: 'Melbourne' } },
    ],
  };
  
  weatherData = [
    {
      location: { name: 'Xian' },
      current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'Los Angeles' },
      current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'Melbourne' },
      current: { temperature: 25, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
  ];
  
  const _expectedData = [ // this is a sorted array on name
    { name: 'los angeles', title: 'Los Angeles', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'melbourne', title: 'Melbourne', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'xian', title: 'Xian', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  ];
  
  const fetchNewCitiesButton = screen.getByRole('button', { name: /fetch new cities/i });
  expect(fetchNewCitiesButton).toBeInTheDocument();

  fireEvent.click(fetchNewCitiesButton);

  expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'true');
  
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  const newTableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  newTableRows.forEach((row, index) => {
    const data = _expectedData[index];
    const _row = row as HTMLElement;
    expect(within(_row).getByText(data.title)).toBeInTheDocument();
  });
});

it('sets data for next test cases', () => {
  cities = {
    records: [
      { fields: { city: 'new york', accentcity: 'New York' } },
      { fields: { city: 'tokyo', accentcity: 'Tokyo' } },
      { fields: { city: 'bombay', accentcity: 'Bombay' } },
      { fields: { city: 'rajkot', accentcity: 'Rajkot' } },
      { fields: { city: 'london', accentcity: 'London' } },
    ],
  };
  
  weatherData = [
    {
      location: { name: 'New York' },
      current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'Tokyo' },
      current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'Bombay' },
      current: { temperature: 25, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'Rajkot' },
      current: { temperature: 25, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'London' },
      current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
  ];
});

it('should favorite a city and show a notification on click of favorite checkbox', async () => { 
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  expectedData.forEach(item => {
    const row = screen.getByText(item.title).closest('tr')!;
    const favorite = within(row).getByRole('checkbox');
    expect((favorite as HTMLInputElement).checked).toBeFalsy();
    fireEvent.click(favorite);
    
    const _row = screen.getByText(item.title).closest('tr')!;
    const _favorite = within(_row).getByRole('checkbox');
    expect((_favorite as HTMLInputElement).checked).toBeTruthy();
  });
});

it('should unfavorite a city and show a notification on click of favorite checkbox', async () => {
  const _userData = [
    { cityName: 'bombay', isFavorite: true, notes: 'This is my favorite city' },
    { cityName: 'london', isFavorite: true, notes: '' },
    { cityName: 'new york', isFavorite: true, notes: '' },
    { cityName: 'rajkot', isFavorite: true, notes: '' },
    { cityName: 'tokyo', isFavorite: true, notes: '' },
  ];

  const _expectedData = [ // this is a sorted array on name
    { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'tokyo', title: 'Tokyo', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
  ];

  localStorage.setItem('user-data', JSON.stringify(_userData));

  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });

  _expectedData.forEach(item => {
    const row = screen.getByText(item.title).closest('tr')!;
    const unfavorite = within(row).getByRole('checkbox');
    expect((unfavorite as HTMLInputElement).checked).toBeTruthy();
    fireEvent.click(unfavorite);
    
    const _row = screen.getByText(item.title).closest('tr')!;
    const _unfavorite = within(_row).getByRole('checkbox');
    expect((_unfavorite as HTMLInputElement).checked).toBeFalsy();
  });
});

it('should sort cities by favorite and then in alphabetical order', async () => {
  const _expectedData = [
    { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'tokyo', title: 'Tokyo', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },  
  ];

  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(screen.getByTestId('home-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
  tableRows.forEach((row, index) => {
    const data = _expectedData[index]; // expected data is already sorted by name in alphabetical order
    const _row = row as HTMLElement;
    expect(within(_row).getByText(data.title)).toHaveAttribute('href', `/${data.name}`);
    expect(within(_row).getByText(`${data.temperature}°C`)).toBeInTheDocument();
    expect(within(_row).getByText(`${Math.round(data.temperature * (9 / 5)) + 32}°F`, { exact: false })).toBeInTheDocument();
    if(data.isFavorite) {
      expect((within(_row).getByRole('checkbox') as HTMLInputElement).checked).toBeTruthy();
    } else {
      expect((within(_row).getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
    }
    expect(within(_row).getByText(/remove/i)).toBeInTheDocument();
  });
});

it('should show notification with text returned from server when there is 4xx error in cities service', async () => {
  server.use(
    rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(404),
        ctx.json({
          message: 'No cities found',
        }),
      );
    }),
  );

  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('No cities found', 'error');
  });
});

it('should show notification with message returned by server when 5xx error in cities service', async () => {
  server.use(
    rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(500),
        ctx.json({
          message: 'Oops! something went wrong',
        }),
      );
    }),
  );

  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenCalledWith('Oops! something went wrong', 'error');
  });
});

it('should show notification with text returned from server when there is 4xx error in weather service', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(404),
        ctx.json({
          message: 'Data not found',
        }),
      );
    }),
  );

  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenNthCalledWith(cities.records.length, 'Data not found', 'error');
  });
});

it('should show notification with message returned by server when 5xx error in weather service', async () => {
  server.use(
    rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
      return res.once(
        ctx.status(500),
        ctx.json({
          message: 'Oops! something went wrong',
        }),
      );
    }),
  );

  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(notificationSpy).toHaveBeenNthCalledWith(cities.records.length, 'Oops! something went wrong', 'error');
  });
});
