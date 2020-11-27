import useSWR from 'swr';

import { Weather } from '../interfaces';
import { BASE_URL, WEATHER_STACK_API_KEY } from '../../config';
import { compareCityNames } from '../utils';

interface WeatherResponse {
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
  data?: WeatherResponse,
  error?: {
    message: string;
  }
}

interface WeatherResponseMultiple {
  data?: WeatherResponse[];
  error?: {
    message: string;
  }
}

interface WeatherData {
  weatherCollection?: Weather[];
  weather?: Weather;
  loading: boolean;
  error?: {
    message: string;
  }
}

interface Props {
  cityName: string | string[];
};

const useWeather = ({ cityName }: Props) => {
  const response: WeatherResponseSingular & WeatherResponseMultiple = useSWR(
    (() => {
      if (Array.isArray(cityName)) {
        return cityName.length > 0
        ? `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&query=${cityName.join(';')}`
        : null
      }
      return `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&query=${cityName}`
    })(),
    { shouldRetryOnError: false }
  );

  let weatherCollection: Weather[] = [];
  let weather: Weather | undefined;
  let _error = response.error;

  if (response.data?.error) {
    const { code, info } = response.data.error;
    _error = { message: code === 615 ? 'Weather info for this city is not available' : info };
  }

  if(!_error) {
    if (Array.isArray(response.data)) {
      const { data } : WeatherResponseMultiple = response;
      weatherCollection = data?.map(item => ({
        title: item.location.name,
        temperature: item.current.temperature,
        precipitation: item.current.precip,
        humidity: item.current.humidity,
        windSpeed: item.current.wind_speed,
        imageSource: item.current.weather_icons[0],
      })) || [];
    } else {
      const { data } : WeatherResponseSingular = response;
      if (data) {
        if (typeof cityName === 'string' && !compareCityNames(data.location.name, cityName)) {
          weather = undefined;
        } else {
          weather = {
            title: data.location.name,
            temperature: data.current.temperature,
            precipitation: data.current.precip,
            humidity: data.current.humidity,
            windSpeed: data.current.wind_speed,
            imageSource: data.current.weather_icons[0],
          };
        }
      }
    }
  }

  const returnData: WeatherData  = {
    loading: !_error && !response.data,
    error: _error,
  }

  if(weatherCollection && weatherCollection.length > 0) {
    returnData.weatherCollection = weatherCollection;
  } else {
    returnData.weather = weather;
  }

  return returnData;
};

export default useWeather;