import useSWR from 'swr';

import { Weather } from '../interfaces';
import { BASE_URL, WEATHER_STACK_API_KEY } from '../../config';

interface WeatherData {
  location: {
    name: string;
  },
  current: {
    temperature: number;
    precip: number;
    humidity: number;
    wind_speed: number;
    weather_icons: string[];
  },
  error?: {
    code: number;
    info: string;
  },
}

interface WeatherResponseSingular {
  data?: WeatherData,
  error?: {
    message: string;
  }
}

interface WeatherResponseMultiple {
  data?: WeatherData[],
  error?: {
    message: string;
  }
}

interface Props {
  cityName: string | string[];
};

const useWeather = ({ cityName }: Props) => {
  const response = useSWR(
    (() => {
      if (Array.isArray(cityName)) {
        return cityName.length > 0
          ? `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&query=${cityName.join(';')}`
          : null
      }
      return `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&query=${cityName}`
    })()
  );

  if (Array.isArray(response.data)) {
    const { data, error }: WeatherResponseMultiple = response;

    let weatherCollection: Weather[] = [];
    let _error = error;

    if (!_error) {
      weatherCollection = data?.map(item => ({
        title: item.location.name,
        temperature: item.current.temperature,
        precipitation: item.current.precip,
        humidity: item.current.humidity,
        windSpeed: item.current.wind_speed,
        imageSource: item.current.weather_icons[0],
      })) || [];
    }

    return {
      weatherCollection,
      loading: !_error && !data,
      error: _error,
    };
  } else {
    const { data, error }: WeatherResponseSingular = response;

    let weather: Weather | undefined = undefined;
    let _error = error;

    if (data?.error) {
      _error = { message: data?.error.info };
    }

    if (!_error && data && data.location) {
      weather = {
        title: data.location.name || cityName as string,
        temperature: data.current.temperature || 0,
        precipitation: data.current.precip || 0,
        humidity: data.current.humidity || 0,
        windSpeed: data.current.wind_speed || 0,
        imageSource: data.current.weather_icons[0] || '',
      };
    }

    return {
      weather,
      loading: !_error && !data,
      error: _error,
    };
  }
};

export default useWeather;