import React, { FunctionComponent, useState } from 'react';

import WeatherReport from './WeatherReport';
import { getExcludedCities, getFavorites, getRemovedCities, getRestoredCities, updateExcludedCities } from '../../shared/actions';
import { showNotification } from '../../shared/notifier';
import useCity from '../../shared/useCity';
import useWeather from '../../shared/useWeather';
import Loader from '../../components/Loader';

export const PAGE_SIZE = 15;

const Home: FunctionComponent = () => {
  const [, forceUpdate] = useState(false);

  const excludedCities = getExcludedCities();
  const {
    cities, isLoading: citiesLoading,
    isError: citiesHasError, error: citiesError
  } = useCity({
    rows: PAGE_SIZE,
    sort: 'population',
    exclude: excludedCities,
  });

  const removedCities = getRemovedCities();
  const restoredCities = getRestoredCities();
  const favoriteCities = getFavorites().map(city => city.cityName);

  const {
    weatherCollection, isLoading: weatherCollectionLoading = true,
    isError: weatherCollectionHasError, error: weatherCollectionError,
  } = useWeather({
    cityNames: citiesLoading
      ? []
      : [
        ...cities
          .filter(city => {
            if(removedCities.includes(city.name)) return false;
            if(restoredCities.includes(city.name)) return false;
            if(favoriteCities.includes(city.name)) return false;
            return true;
          })
          .map(city => city.name),
        ...restoredCities,
        ...favoriteCities.filter(city => !(removedCities.includes(city) || restoredCities.includes(city))),
      ]
  });

  const handleFetchNewCities = () => {
    updateExcludedCities();
    forceUpdate(prevValue => !prevValue);
  };

  if (citiesHasError) {
    showNotification(citiesError.message, 'error');
  }
  
  if (weatherCollectionHasError) {
    if (weatherCollectionError?.message) {
      showNotification(weatherCollectionError.message, 'error');
    }
  }

  if(!(citiesLoading || weatherCollectionLoading) && cities.length === 0) {
    return <div className="no-data">No data available!</div>
  }
  
  return (
    <div className="home">
      <Loader loading={citiesLoading || weatherCollectionLoading} data-testid="home-loader">
        <WeatherReport
          weatherCollection={weatherCollection}
          loading={citiesLoading || weatherCollectionLoading}
          handleFetchNewCities={handleFetchNewCities}
        />
      </Loader>
    </div>
  )
};

export default Home;
