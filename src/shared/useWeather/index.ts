import { useQueries } from 'react-query';

import { Weather } from '../interfaces';
import { compareCityNames, fetcher } from '../utils';
import { BASE_URL, WEATHER_STACK_API_KEY } from '../../config';
import { writeToStorage } from '../storage';

export type SortType = 'population';

interface Props {
  cityNames: string[];
}

interface WeatherResponse {
  location: {
    name: string;
  };
  current: {
    temperature: number;
    precip: number;
    humidity: number;
    wind_speed: number;
    wind_dir: string;
    wind_degree: number;
    cloudcover: number;
    uv_index: number;
    pressure: number;
  }
}

interface InternalError {
  error?: {
    code: number;
    info: string;
  }
}

const fetchWeather = async (cityName: string): Promise<WeatherResponse> => {
  try {
    const url = `${BASE_URL.WEATHER_SERVICE}?access_key=${WEATHER_STACK_API_KEY}&query=${cityName}`;
    const weather: WeatherResponse & InternalError = await fetcher(url);
    if (weather.error) {
      throw new Error(weather.error.info);
    }
    return weather;
  } catch (err) {
    throw err;
  }
};

const useWeather = ({ cityNames }: Props) => {
  const weatherQueries = useQueries(
    cityNames.map(cityName => {
      const queryKey = ['city', cityName];
      return {
        queryKey: queryKey,
        queryFn: () => fetchWeather(cityName),
        cacheTime: 86400000,
        staleTime: 600000,
        retry: 0,
        onSuccess: (data) => writeToStorage(JSON.stringify(queryKey), data),
      };
    })
  )

  const weatherCollection: Weather[] = weatherQueries
    .filter(item => item.data)
    .filter(item => {
      const { data } = item;
      if(!item.data) return true;
      const { location, current } = data as WeatherResponse;
      return (location && current && cityNames.find(city => compareCityNames(city, location?.name || '')));
    })
    .map(item => {
      const { data } = item;
      const { location, current } = data as WeatherResponse;
      return {
        name: cityNames.find(city => compareCityNames(city, location.name || '')) || location.name,
        title: location.name,
        temperature: current.temperature,
        precipitation: current.precip,
        humidity: current.humidity,
        windSpeed: current.wind_speed,
        windDirection: current.wind_dir,
        windDegree: current.wind_degree,
        cloudCover: current.cloudcover,
        uvIndex: current.uv_index,
        pressure: current.pressure,
      };
    });

    const isError = weatherQueries.some(item => item.isError);
    const error = weatherQueries.find(item => item.error)?.error;
    let isLoading = true;
    if (isError || weatherCollection.length > 0) {
      isLoading = weatherQueries.some(item => item.isLoading);
    }
    let data: Weather[] = [];
    if(!isLoading) {
      data = weatherCollection;
    }

  return { weatherCollection: data, isLoading, isError, error: error as Error };
};

export default useWeather;