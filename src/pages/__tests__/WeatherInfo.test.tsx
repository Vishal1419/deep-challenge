import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SWRConfig, cache } from 'swr';
import { BrowserRouter, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect'

import WeatherInfo from '../WeatherInfo';
import * as notificationHelpers from '../../shared/notifier';
import { BASE_URL } from '../../config';
import { fetcher } from '../../shared/utils';
import { UserData, Weather } from '../../shared/interfaces';
import { saveUserData } from '../../shared/actions';

let cityName = 'tokyo';

let data = {
  location: { name: 'Tokyo' },
  current: { temperature: 12, precip: 5, humidity: 20, wind_speed: 6, weather_icons: ['https://fake-host/image.png'] },
};

let expectedData: Weather = {
  title: 'Tokyo',
  temperature: 12,
  precipitation: 5,
  humidity: 20,
  windSpeed: 6,
  imageSource: 'https://fake-host/image.png',
};

const KEY = 'user-data';
let VALUES: UserData[];

const server = setupServer(
  rest.get(BASE_URL.WEATHER_SERVICE, (req, res, ctx) => {
    const _data = data;
    return res(
      ctx.status(200),
      ctx.json(_data),
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

const renderWithRouter = (ui: React.FunctionComponent, { route = '/tokyo', path = '/:cityName' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <SWRConfig value={{ fetcher, dedupingInterval: 0 }}>
      <BrowserRouter>
        <Route path={path} component={ui} />
      </BrowserRouter>
    </SWRConfig>
  );
};

beforeAll(() => server.listen());
beforeEach(() => {
  cache.clear();
  VALUES = [
    {
      cityName: 'test1',
      isFavorite: true,
      notes: 'Notes for test1',
    },
    {
      cityName: 'test2',
      isFavorite: false,
      notes: 'Notes for test2',
    },
    {
      cityName: 'test3',
      isFavorite: true,
      notes: '',
    },
  ];
  localStorage.setItem(KEY, JSON.stringify(VALUES));
});

afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
  cache.clear();
});
afterAll(() => server.close());

const renderWeatherInfo = () => {
  return renderWithRouter(
    WeatherInfo,
    { route: `/${cityName}` }
  );
}

it('should show a loader initially', () => {
  renderWeatherInfo();
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
});

it('should hide the loader after data is fetched', async () => {
  renderWeatherInfo();
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
});

it('should show city name returned from server', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByText(expectedData.title)).toBeInTheDocument();
});

it('should show image returned from server', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByRole('img')).toHaveAttribute('src', expectedData.imageSource);
});

it('should show temperature returned from server', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByText(`${expectedData.temperature}`)).toBeInTheDocument();
});

it('should show unit of temperature as °C besides temperature', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  const container = screen.getByText(`${expectedData.temperature}`);
  expect(container).toBeInTheDocument();
  const containerParent = container.parentElement;
  expect(within((containerParent as HTMLElement)).getByText('°C')).toBeInTheDocument();
});

it('shows precipitation and its value with unit', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  const container = screen.getByText('Precipitation');
  expect(container).toBeInTheDocument();
  const containerParent = container.closest('tr');
  expect(within((containerParent as HTMLElement)).getByText(`${expectedData.precipitation}%`)).toBeInTheDocument();
});

it('shows humidity and its value with unit', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  const container = screen.getByText('Humidity');
  expect(container).toBeInTheDocument();
  const containerParent = container.closest('tr');
  expect(within((containerParent as HTMLElement)).getByText(`${expectedData.humidity}%`)).toBeInTheDocument();
});

it('shows wind speed and its value with unit', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  const container = screen.getByText('Wind');
  expect(container).toBeInTheDocument();
  const containerParent = container.closest('tr');
  expect(within((containerParent as HTMLElement)).getByText(`${expectedData.windSpeed} km/h`)).toBeInTheDocument();
});

it('renders favorite as checked initially when it is favorite in local-storage', async () => {
  const ITEM = {
    cityName,
    isFavorite: true,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeTruthy();
});

it('renders favorite as unchecked initially when it is not favorite in local-storage', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
});

it('renders favorite as unchecked initially when item is not present in user-data', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
});

it('toggles isFavorite in user data in local-storage on favorite click', async () => {
  renderWeatherInfo();

  const initialData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const initialDataItem = initialData.find(item => item.cityName === cityName);

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('checkbox'));
  const newData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const newDataItem = newData.find(item => item.cityName === cityName);
  
  expect(newDataItem?.isFavorite).not.toEqual(initialDataItem?.isFavorite);
  
  fireEvent.click(screen.getByRole('checkbox'));
  
  const latestData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const latestDataItem = latestData.find(item => item.cityName === cityName);

  expect(latestDataItem?.isFavorite).not.toEqual(newDataItem?.isFavorite);
});

it('changes favorite label on favorite click', async () => {
  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  expect(screen.getByText(/mark as favorite/i)).toBeInTheDocument();
  expect(screen.queryByText(/remove from favorites/i)).not.toBeInTheDocument();
  
  fireEvent.click(screen.getByRole('checkbox'));
  
  expect(screen.queryByText(/mark as favorite/i)).not.toBeInTheDocument();
  expect(screen.getByText(/remove from favorites/i)).toBeInTheDocument();
});

it('shows notification on favorite click', async () => {
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('checkbox'));
  expect(notificationSpy).toHaveBeenNthCalledWith(1, 'Marked as favorite!', 'success', 2000);

  fireEvent.click(screen.getByRole('checkbox'));
  expect(notificationSpy).toHaveBeenNthCalledWith(2, 'Removed from favorites!', 'success', 2000);

});

it ('saves new item with provided notes on save click when item is not present in user-data', async () => {
  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  const notes = `This is test notes for ${cityName}`;
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item).toBeDefined();
  expect(item?.notes).toEqual(notes);
});

it ('replaces notes with provided notes on save click when item is favorite', async () => {
  const ITEM = {
    cityName,
    isFavorite: true,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);

  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  const notes = `This is test notes for ${cityName}`;
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item?.notes).toEqual(notes);
});

it('removes notes correctly on save when item is favorite', async () => {
  const ITEM = {
    cityName,
    isFavorite: true,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);

  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  const notes = '';
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item?.notes).toEqual(notes);
});

it('removes item from user-data on save when notes is empty and item is not favorite', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);

  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  const notes = '';
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item).toBeUndefined();
});

it('shows notification on notes save', async () => {
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('button', { name: /save/i }));
  
  expect(notificationSpy).toHaveBeenNthCalledWith(1, 'Notes saved!', 'success', 3000);

  const notes = 'Test notes';
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(notificationSpy).toHaveBeenNthCalledWith(2, 'Notes saved!', 'success', 3000);
});

it('does not touch notes on favorite click', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);

  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('checkbox'));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item?.notes).toEqual(ITEM.notes);
});

it('does not touch favorite on notes save', async () => {
  const ITEM = {
    cityName,
    isFavorite: true,
    notes: 'Test Notes',
  };
  saveUserData(ITEM);

  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  const notes = 'Changed note';
  fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item?.isFavorite).toEqual(ITEM.isFavorite);
});

it('does not save stale data', async () => {
  renderWeatherInfo();

  await waitFor(() => {
    expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
  });

  for (let i = 0; i < 20; i++) {
    if (Math.random() <= 0.5) {
      fireEvent.click(screen.getByRole('checkbox'));
    }

    let notes = '';
    if (Math.random() <= 0.5) {
      notes = 'Changed note';
    } else {
      notes = '';
    }
    fireEvent.change(screen.getByLabelText(/notes/i), { target: { value: notes }});

    if (Math.random() <= 0.5) {
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
    }

    const userData: UserData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    expect(userData.find(item => !item.isFavorite && !item.notes)).toBeUndefined();
  }
});