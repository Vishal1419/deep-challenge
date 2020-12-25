import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter, Route } from 'react-router-dom';
import Dialog from 'react-modal';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom/extend-expect'

import WeatherInfo from '../WeatherInfo';
import * as notificationHelpers from '../../shared/notifier';
import { BASE_URL } from '../../config';
import { UserData, Weather } from '../../shared/interfaces';
import { getRemovedCities, getRestoredCities, getUserData, removeCity, saveUserData } from '../../shared/actions';

let cityName = 'tokyo';

let data = {
  location: { name: 'Tokyo' },
  current: {
    temperature: 12,
    precip: 5,
    humidity: 20,
    wind_speed: 6,
    wind_dir: 'N',
    wind_degree: 130,
    cloudcover: 10,
    uv_index: 6,
    pressure: 1011,
  },
};

let expectedData: Weather = {
  name: 'tokyo',
  title: 'Tokyo',
  temperature: 12,
  precipitation: 5,
  humidity: 20,
  windSpeed: 6,
  windDirection: 'N',
  windDegree: 130,
  cloudCover: 10,
  uvIndex: 6,
  pressure: 1011,
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

  const queryClient = new QueryClient();

  const { container, ...rest } = render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Route path={path} component={ui} />
      </BrowserRouter>
    </QueryClientProvider>
  );

  Dialog.setAppElement(container as HTMLElement);
  return { container, ...rest };
};

beforeAll(() => server.listen());
beforeEach(() => {
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
});
afterAll(() => server.close());

const renderWeatherInfo = () => {
  localStorage.setItem('is-location-granted', JSON.stringify(true));
  return renderWithRouter(
    WeatherInfo,
    { route: `/${cityName}` }
  );
}

it('should show a loader initially', () => {
  renderWeatherInfo();
  expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'true');
});

it('should hide the loader after data is fetched', async () => {
  renderWeatherInfo();
  expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'true');
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
});

it('should show city name returned from server', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByText(expectedData.title)).toBeInTheDocument();
});

it('renders restore button when city is already removed', async () => {
  removeCity(cityName);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByRole('button', { name: /restore/i })).toBeInTheDocument();
});

it('should restore city and show notification on click of restore button', async () => {
  removeCity(cityName);
  let restoredCities = getRestoredCities();
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');

  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });

  expect(restoredCities).toEqual([]);
  
  const restoreButton = screen.getByRole('button', { name: /restore/i });
  fireEvent.click(restoreButton);

  const removedCities = getRemovedCities();
  expect(removedCities).toEqual([]);
  restoredCities = getRestoredCities();
  expect(restoredCities).toEqual([cityName]);
  expect(notificationSpy).toHaveBeenCalledWith('City Restored!', 'success', 3000);
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
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeTruthy();
});



it('does not render favorite checkbox when city is already removed', async () => {
  removeCity(cityName);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
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
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
});

it('renders favorite as unchecked initially when item is not present in user-data', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBeFalsy();
});

it('toggles isFavorite in user data in local-storage on favorite click', async () => {
  renderWeatherInfo();

  const initialData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const initialDataItem = initialData.find(item => item.cityName === cityName);

  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
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
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
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
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('checkbox'));
  expect(notificationSpy).toHaveBeenNthCalledWith(1, 'Marked as favorite!', 'success', 2000);

  fireEvent.click(screen.getByRole('checkbox'));
  expect(notificationSpy).toHaveBeenNthCalledWith(2, 'Removed from favorites!', 'success', 2000);

});

it('should render favorite checkbox on click of restore button', async () => {
  removeCity(cityName);

  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  
  const restoreButton = screen.getByRole('button', { name: /restore/i });
  fireEvent.click(restoreButton);

  expect(screen.getByRole('checkbox')).toBeInTheDocument();
});

it('shows temperature and its value with unit °C', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const temperatureLabel = screen.getByText('Temperature');
  const weatherCard = temperatureLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.temperature}°C`)).toBeInTheDocument();
});

it('shows humidity and its value with unit %', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const humidityLabel = screen.getByText('Humidity');
  const weatherCard = humidityLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.humidity}%`)).toBeInTheDocument();
});

it('shows precipitation and its value with unit %', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const precipitationLabel = screen.getByText('Precipitation');
  const weatherCard = precipitationLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.precipitation}%`)).toBeInTheDocument();
});

it('shows cloud cover and its value with unit %', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const cloudCoverLabel = screen.getByText('Cloud Cover');
  const weatherCard = cloudCoverLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.cloudCover}%`)).toBeInTheDocument();
});

it('shows pressure and its value with unit Pa', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const pressureLabel = screen.getByText('Pressure');
  const weatherCard = pressureLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.pressure} Pa`)).toBeInTheDocument();
});

it('shows uv index and its value', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const uvIndexLabel = screen.getByText('UV Index');
  const weatherCard = uvIndexLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(expectedData.uvIndex)).toBeInTheDocument();
});

it('shows wind speed and its value with unit km/h', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const windSpeedLabel = screen.getByText('Wind Speed');
  const weatherCard = windSpeedLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.windSpeed} km/h`)).toBeInTheDocument();
});

it('shows wind direction and its value with unit °', async () => {
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const windDirectionLabel = screen.getByText('Wind Direction');
  const weatherCard = windDirectionLabel.closest('.weather-card')! as HTMLElement;
  expect(within(weatherCard).getByText(`${expectedData.windDegree}° ${expectedData.windDirection}`)).toBeInTheDocument();
});

it('shows notes label', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: '',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByText('Notes')).toBeInTheDocument();
});

it('shows no notes message and add notes button when notes are empty', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: '',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  expect(screen.getByText(/no notes/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add notes/i })).toBeInTheDocument();
});

it('shows cancel and save button along with textarea on click of add notes button', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: '',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const addNotesButton = screen.getByRole('button', { name: /add notes/i });
  fireEvent.click(addNotesButton);
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  expect(screen.getByTestId('textarea')).toBeInTheDocument();
});

it('hides cancel and save button along with textarea and shows no notes message with add notes button on click of cancel', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: '',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const addNotesButton = screen.getByRole('button', { name: /add notes/i });
  fireEvent.click(addNotesButton);
  const textarea = screen.getByTestId('textarea');
  fireEvent.change(textarea, { target: { value: 'test text' }});
  const cancelButton = screen.getByRole('button', { name: /cancel/i });
  fireEvent.click(cancelButton);
  expect(screen.getByText(/no notes/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add notes/i })).toBeInTheDocument();
  const latestUserData = getUserData(cityName);
  expect(latestUserData).toEqual(undefined);
});

it('saves notes and shows textarea in readonly mode \
  and hides save and cancel button \
  and shows edit and delete button \
  on click of save button', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: '',
  };
  saveUserData(ITEM);
  const notificationSpy = jest.spyOn(notificationHelpers, 'showNotification');
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const addNotesButton = screen.getByRole('button', { name: /add notes/i });
  fireEvent.click(addNotesButton);
  const textarea = screen.getByTestId('textarea');
  fireEvent.change(textarea, { target: { value: 'test text' }});
  const cancelButton = screen.getByRole('button', { name: /cancel/i });
  const saveButton = screen.getByRole('button', { name: /save/i });
  fireEvent.click(saveButton);
  expect(notificationSpy).toHaveBeenNthCalledWith(1, 'Notes saved!', 'success', 3000);
  expect(saveButton).not.toBeInTheDocument();
  expect(cancelButton).not.toBeInTheDocument();
  const latestUserData = getUserData(cityName);
  expect(latestUserData?.notes).toEqual('test text');
  expect(textarea).toHaveAttribute('readonly');
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
});

it('shows edit and delete button initially when notes is already present', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const textarea = screen.getByTestId('textarea');
  expect(textarea).toHaveAttribute('readonly');
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
});

it('turns on edit mode on click of edit button', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  fireEvent.click(editButton);
  const cancelButton = screen.getByRole('button', { name: /cancel/i });
  expect(cancelButton).toBeInTheDocument();
  const saveButton = screen.getByRole('button', { name: /save/i });
  expect(saveButton).toBeInTheDocument();
  const textarea = screen.getByTestId('textarea');
  expect(textarea).not.toHaveAttribute('readonly');
});

it('turns off edit mode on click of save after edit', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  fireEvent.click(editButton);
  const textarea = screen.getByTestId('textarea');
  fireEvent.change(textarea, { target: { value: 'Edited text' } });
  const saveButton = screen.getByRole('button', { name: /save/i });
  expect(saveButton).toBeInTheDocument();
  fireEvent.click(saveButton);
  const latestUserData = getUserData(cityName);
  expect(latestUserData?.notes).toEqual('Edited text');
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  expect(textarea).toHaveAttribute('readonly');
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
});

it('shows dialog on click of delete button', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

it('does not change anything on click of cancel after delete', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
  const textarea = screen.getByTestId('textarea');
  expect(textarea).toBeInTheDocument();
  expect(textarea).toHaveAttribute('readonly');  
  const latestUserData = getUserData(cityName);
  expect(latestUserData?.notes).toEqual('Test notes');
  fireEvent.click(deleteButton);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  const cancelButton = screen.getByRole('button', { name: /cancel/i });
  expect(cancelButton).toBeInTheDocument();
  fireEvent.click(cancelButton);
  expect(editButton).toBeInTheDocument();
  expect(deleteButton).toBeInTheDocument();
  expect(textarea).toBeInTheDocument();
  expect(textarea).toHaveAttribute('readonly');  
  const newUserData = getUserData(cityName);
  expect(newUserData?.notes).toEqual('Test notes');
});

it('deletes notes on click of confirm button after delete button click', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const deleteButton = screen.getByRole('button', { name: /delete/i });
  expect(deleteButton).toBeInTheDocument();
  fireEvent.click(deleteButton);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  const confirmButton = screen.getByRole('button', { name: /confirm/i });
  expect(confirmButton).toBeInTheDocument();
  fireEvent.click(confirmButton);
  expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  expect(screen.getByText(/no notes/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add notes/i })).toBeInTheDocument();
  const latestUserData = getUserData(cityName);
  expect(latestUserData).toEqual(undefined);
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
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });

  fireEvent.click(screen.getByRole('checkbox'));

  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const item = userData.find(item => item.cityName === cityName);
  expect(item?.notes).toEqual(ITEM.notes);
});

it('does not touch favorite on notes save', async () => {
  const ITEM = {
    cityName,
    isFavorite: false,
    notes: 'Test notes',
  };
  saveUserData(ITEM);
  renderWeatherInfo();
  await waitFor(() => {
    expect(screen.getByTestId('weather-loader')).toHaveAttribute('aria-busy', 'false');
  });
  const editButton = screen.getByRole('button', { name: /edit/i });
  expect(editButton).toBeInTheDocument();
  fireEvent.click(editButton);
  const textarea = screen.getByTestId('textarea');
  fireEvent.change(textarea, { target: { value: 'Edited text' } });
  const saveButton = screen.getByRole('button', { name: /save/i });
  expect(saveButton).toBeInTheDocument();
  fireEvent.click(saveButton);
  const latestUserData = getUserData(cityName);
  expect(latestUserData?.isFavorite).toEqual(ITEM.isFavorite);
});
