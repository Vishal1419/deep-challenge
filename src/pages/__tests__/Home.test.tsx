import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig, cache } from 'swr';
import { BrowserRouter } from 'react-router-dom';
import Dialog from 'react-modal';
import '@testing-library/jest-dom/extend-expect'

import Home from '../Home';
import { PAGE_SIZE } from '../Home/Home';
import * as useCity from '../../shared/useCity';
import * as notificationHelpers from '../../shared/notifier';
import { BASE_URL } from '../../config';
import { EnhancedCityWeather } from '../Home/WeatherReport';
import { fetcher, compareCityNames } from '../../shared/utils';

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
    location: { name: 'Tokyo' },
    current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
  },
  {
    location: { name: 'New York' },
    current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
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

let expectedData: EnhancedCityWeather[];
const removedCities = ['tokyo', 'bombay'];
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
    const q = req.url.searchParams.get('query')!;
    const query = q.split(';');
    return res(
      ctx.status(200),
      ctx.json(query.length > 1 ? weatherData : weatherData[0]),
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

const renderHome = () => {
  const { container, ...rest } = render(
    <SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </SWRConfig>
  );
  Dialog.setAppElement(container);
  return { container, ...rest };
};

it('should show a loader initially', () => {
  renderHome();
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
});

it('should hide the loader after data is fetched', async () => {
  renderHome();
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  })
});

it('should show city and temperature column headers', () => {
  renderHome();
  const row = screen.getByText(/city/i).closest('tr')!;
  expect(within(row).getByText(/city/i)).toBeInTheDocument();
  expect(within(row).getByText(/temp/i)).toBeInTheDocument();
});

it('sets data for initialization phase', () => {
  // we have to do this instead of creating a describe block
  // because describe blocks in a test file will run in parallel 
  expectedData = [ // this is a sorted array on name
    { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'tokyo', title: 'Tokyo', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  ];
});

it(`should fetch ${PAGE_SIZE} largest cities by population`, () => {
  const spy = jest.spyOn(useCity, 'default');
  renderHome();
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      rows: PAGE_SIZE,
      sort: 'population',
    }),
  );
});
  
it('should sort alphabetically', async () => {
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((item, index) => {
      expect(within(item as HTMLElement).getByText(expectedData[index].title)).toBeInTheDocument();
    });
  });
});
  
it('should show city names with respective temperature and remove button', async () => {
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((row, index) => {
      const data = expectedData[index];
      expect(within(row as HTMLElement).getByText(data.title)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${data.temperature}°C`)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${Math.round(data.temperature * (9 / 5)) + 32}°F`, { exact: false })).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(/remove/i)).toBeInTheDocument();
    });
  });
});
  
it('should show a dialog on click of each remove button', async () => {
  renderHome();
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach(row => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const removeButton = within(row as HTMLElement).getByText(/remove/i);
      fireEvent.click(removeButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const cancelButton = screen.getByText(/cancel/i);
      expect(cancelButton).toBeInTheDocument();
      fireEvent.click(cancelButton); // need to close the dialog for next iteration to expect dialog is not present
    })
  });
});
  
it('should close the dialog and should not remove the row when clicking on cancel', async () => {
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach(row => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const removeButton = within(row as HTMLElement).getByText(/remove/i);
      fireEvent.click(removeButton);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(row).toBeInTheDocument();
      const newTableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
      expect(newTableRows.length).toEqual(tableRows.length);
    });
  });
});
  
it('should close the dialog and remove whole row with notification when clicking on confirm', async () => {
    const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
    renderHome();
    await waitFor(() => {
      expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
      const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
      for (let i = tableRows.length - 1; i >= 0; i--) {
        const row = tableRows[i];
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        const removeButton = within(row as HTMLElement).getByText(/remove/i);
        fireEvent.click(removeButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        fireEvent.click(screen.getByText(/confirm/i));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(row).not.toBeInTheDocument();
        expect(notificationSpy).toHaveBeenNthCalledWith(tableRows.length - i, "City removed!");
        const newTableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
        expect(newTableRows.length).toEqual(tableRows.length - 1);
      }
    })
});

// ======================= removed cities =======================

it('sets data for next tests, which takes removed cities in consideration', () => {
  cities = {
    records: [
      { fields: { city: 'new york', accentcity: 'New York' } },
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
      location: { name: 'Rajkot' },
      current: { temperature: 25, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'London' },
      current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
  ];
  
  expectedData = [ // this is a sorted array on name
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  ];
});

it(`should fetch ${PAGE_SIZE} largest cities by population excluding removed cities`, () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  const spy = jest.spyOn(useCity, 'default');
  renderHome();
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      rows: PAGE_SIZE,
      sort: 'population',
      exclude: removedCities,
    }),
  );
});

it('should not show removedCities', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByText(/tokyo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bombay/i)).not.toBeInTheDocument();
  });
});

it('should add city to removed-items in local storage on click of remove button', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr', );
    for (let i = tableRows.length - 1; i >= 0; i--) {
      const row = tableRows[i];
      const data = expectedData[i];
      const removeButton = within(row as HTMLElement).getByText(/remove/i);
      fireEvent.click(removeButton);
      const confirmButton = screen.getByText(/confirm/i);
      fireEvent.click(confirmButton);
      const newRemovedCities: string[] = JSON.parse(localStorage.getItem('removed-cities') || '[]');
      expect(newRemovedCities).toContain(data.name);
    }
  });
});

// we can repeat test cases from initialization tests to check for side-effects,
// but not done to stop growing this file and make tests faster

// ======================= favorite cities =======================

it('sets data for next tests, which takes favorite cities in consideration', () => {
  cities = {
    records: [
      { fields: { city: 'tokyo', accentcity: 'Tokyo' } },
      { fields: { city: 'rajkot', accentcity: 'Rajkot' } },
      { fields: { city: 'london', accentcity: 'London' } },
    ],
  };
  
  weatherData = [
    {
      location: { name: 'Tokyo' },
      current: { temperature: 25, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
    },
    {
      location: { name: 'New York' },
      current: { temperature: 15, precip: 0, humidity: 80, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
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
  
  expectedData = [ // this array is sorted first by is favorite and then by alphabetical order
    { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'tokyo', title: 'Tokyo', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  ];
});

it(`should fetch ${PAGE_SIZE} largest cities by population excluding favorite cities`, () => {
  localStorage.setItem('user-data', JSON.stringify(userData));
  const spy = jest.spyOn(useCity, 'default');
  renderHome();
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      rows: PAGE_SIZE,
      sort: 'population',
      exclude: userData.filter(item => item.isFavorite).map(item => item.cityName),
    }),
  );
});

it('should sort data by favorites and then alphabetically', async () => {
  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((row, index) => {
      expect(within(row as HTMLElement).getByText(expectedData[index].title)).toBeInTheDocument();
    });
  })
});

it('should show city with respective temperature and \
    should show heart icon and should not show remove button when city is favorite \
    and should not show hear icon and should show remove button when city is not favorite', async () => {
  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((row, index) => {
      const data = expectedData[index];
      expect(within(row as HTMLElement).getByText(data.title)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${data.temperature}°C`)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${Math.round(data.temperature * (9 / 5)) + 32}°F`, { exact: false })).toBeInTheDocument();
      if (data.isFavorite) {
        expect(within(row as HTMLElement).getByTestId('HeartIcon')).toBeInTheDocument();
        expect(within(row as HTMLElement).queryByText(/remove/i)).not.toBeInTheDocument();
      } else {
        expect(within(row as HTMLElement).queryByTestId('HeartIcon')).not.toBeInTheDocument();
        expect(within(row as HTMLElement).getByText(/remove/i)).toBeInTheDocument();
      }
    });
  });
});

// we can repeat test cases from initialization tests to check for side-effects,
// but not done to stop growing this file and make tests faster

// ======================= removed cities + favorite cities =======================

it('sets data for next tests, which takes removed cities and favorite cities in consideration', () => {
  cities = {
    records: [
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
  
  expectedData = [
    { name: 'bombay', title: 'Bombay', temperature: 25, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'new york', title: 'New York', temperature: 15, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: true },
    { name: 'london', title: 'London', temperature: 12, precipitation: 5, humidity: 20, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
    { name: 'rajkot', title: 'Rajkot', temperature: 25, precipitation: 0, humidity: 80, windSpeed: 6, imageSource: 'https://fake-host/image.png', isFavorite: false },
  ];
});

it(`should fetch ${PAGE_SIZE} largest cities by population excluding removed and favorite cities`, () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  const spy = jest.spyOn(useCity, 'default');
  renderHome();
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      rows: PAGE_SIZE,
      sort: 'population',
      exclude: [
        ...removedCities,
        ...userData.filter(item => item.isFavorite).map(item => item.cityName),
      ]
    }),
  );
});

it('should sort data by favorites and then alphabetically', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((item, index) => {
      expect(within(item as HTMLElement).getByText(expectedData[index].title)).toBeInTheDocument();
    });
  })
});

it('should show city with respective temperature and \
      should show heart icon if city is favorite (and removed or not)\
      and should not show remove button if city is favorite (and removed or not)\
      and should show restore button if city is favorite and removed \
      and should not show restore button if city is favorite and not removed \
      and should not show heart icon and should show remove button if city is not favorite \
      and should not show restore button if city is not favorite', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach((row, index) => {
      const data = expectedData[index];
      expect(within(row as HTMLElement).getByText(data.title)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${data.temperature}°C`)).toBeInTheDocument();
      expect(within(row as HTMLElement).getByText(`${Math.round(data.temperature * (9 / 5)) + 32}°F`, { exact: false })).toBeInTheDocument();
      if (data.isFavorite) {
        expect(within(row as HTMLElement).getByTestId('HeartIcon')).toBeInTheDocument();
      } else {
        expect(within(row as HTMLElement).queryByTestId('HeartIcon')).not.toBeInTheDocument();
      }
      if (data.isFavorite && removedCities.find(item => compareCityNames(item, data.name))) {
        expect(within(row as HTMLElement).getByText(/restore/i)).toBeInTheDocument();
        expect(within(row as HTMLElement).queryByText(/remove/i)).not.toBeInTheDocument();
      } else if (data.isFavorite) {
        expect(within(row as HTMLElement).queryByText(/restore/i)).not.toBeInTheDocument();
        expect(within(row as HTMLElement).queryByText(/remove/i)).not.toBeInTheDocument();
      } else if (!data.isFavorite) {
        expect(within(row as HTMLElement).queryByText(/restore/i)).not.toBeInTheDocument();
        expect(within(row as HTMLElement).getByText(/remove/i)).toBeInTheDocument();
      }
    });
  });
});

it('should remove city from local storage and remove restore button with notification on restore button click', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    tableRows.forEach(async (row, index) => {
      const data = expectedData[index];
      if(data.isFavorite && removedCities.find(item => compareCityNames(item, data.name))) {
        const restoreButton = within(row as HTMLTableRowElement).getByText(/restore/i);
        expect(restoreButton).toBeInTheDocument();
        fireEvent.click(restoreButton);
        const newRemovedCities: string[] = JSON.parse(localStorage.getItem('removed-items') || '[]')
        expect(newRemovedCities).not.toContain(data.name);
        expect(restoreButton).not.toBeInTheDocument();
        expect(notificationSpy).toHaveBeenNthCalledWith(index + 1, 'City restored!');
      }
    });
  })
});

it('should fetch new data when all non-favorite cities are removed', async () => {
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  localStorage.setItem('user-data', JSON.stringify(userData));
  const spy = jest.spyOn(useCity, 'default');
  renderHome();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
    const tableRows = screen.getByRole('table').querySelectorAll('tbody > tr');
    for (let i = tableRows.length - 1; i >= 0; i--) {
      const row = tableRows[i];
      const data = expectedData[i];
      if(!data.isFavorite) {
        const removeButton = within(row as HTMLElement).getByText(/remove/i);
        fireEvent.click(removeButton);
        const confirmButton = screen.getByRole('button', { name: /confirm/i });
        fireEvent.click(confirmButton);
      }
    };
  }).then(() => {
    expect(spy).toHaveBeenNthCalledWith(spy.mock.calls.length,
      expect.objectContaining({
        exclude: [
          ...removedCities,
          ...expectedData
            .filter(item => !item.isFavorite)
            .map(item => item.name)
            .reverse(), // reverse because we are looping backwards to remove cities
          ...userData.filter(item => item.isFavorite).map(item => item.cityName),
        ]
      })
    );
  });
});

// we can repeat test cases from initialization tests to check for side-effects,
// but not done to stop growing this file and make tests faster

// ======================= error throwing =======================

it('should show notification with text returned from server when there is 4xx error', async () => {
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

it('should show notification with message returned by server when 5xx error', async () => {
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
