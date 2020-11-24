import React, { FunctionComponent, useState } from 'react';
import debounce from 'debounce-promise';

import WeatherReport from './WeatherReport';
import useCity from '../../shared/useCity';
import useWeather from '../../shared/useWeather';
import { getFavorites, getRemovedCities } from '../../shared/actions';
import { compareCityNames } from '../../shared/utils';
import { showNotification } from '../../shared/notifier';

export const PAGE_SIZE = 2;

const Home: FunctionComponent = () => {
  const [, forceUpdate] = useState(false);

  const favorites = getFavorites();
  const removedCities = getRemovedCities();
  
  const { cities = [], loading: citiesLoading, error: citiesError } = useCity({
    rows: PAGE_SIZE,
    sort: 'population',
    exclude: [...removedCities, ...favorites.map(userData => userData.cityName)],
  });

  const { weatherCollection = [], loading: weatherLoading, error: weatherError } = useWeather({
    cityName: [...favorites.map(userData => userData.cityName), ...cities.map(city => city.name)],
  });
  
  const cityWeatherCollection = weatherCollection
    ?.map(weatherInfo => ({
      name: cities.find(city => compareCityNames(city.name, weatherInfo.title))?.name
        || favorites.find(userData => compareCityNames(userData.cityName, weatherInfo.title))?.cityName
        || '',
      title: weatherInfo.title,
      temperature: weatherInfo.temperature,
      precipitation: weatherInfo.precipitation,
      humidity: weatherInfo.humidity,
      windSpeed: weatherInfo.windSpeed,
      imageSource: weatherInfo.imageSource,
      isFavorite: !!favorites.find(userData => compareCityNames(userData.cityName, weatherInfo.title)),
    })) || [];
    
  const rerender = () => {
    forceUpdate(prevValue => !prevValue);
  }

  if (citiesError || weatherError) {
    const errorMessage = citiesError?.message || weatherError?.message || '';
    if (errorMessage) {
      debounce(() => {
        showNotification(errorMessage, 'error');
      }, 300)();
    }
  }

  if(!(citiesLoading || weatherLoading) && cityWeatherCollection.length === 0) {
    return <div className="no-data">No data available</div>
  }

  return (
    <div className="home">
      <WeatherReport
        cityWeatherCollection={cityWeatherCollection}
        loading={citiesLoading || weatherLoading}
        rerender={rerender}
      />
    </div>
  );
};

export default Home;
