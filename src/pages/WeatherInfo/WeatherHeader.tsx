import React, { FunctionComponent, useState, useEffect } from 'react';

import Button from '../../components/Button';
import Favorite from '../../components/Favorite';
import { getRemovedCities, getUserData, restoreCity, saveUserData } from '../../shared/actions';
import { Weather } from '../../shared/interfaces';
import { showNotification } from '../../shared/notifier';

interface Props {
  weather: Weather;
}

const WeatherHeader: FunctionComponent<Props> = ({ weather }) => {
  const [, forceUpdate] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const initialValues = getUserData(weather.name);
    if (initialValues) {
      setIsFavorite(initialValues.isFavorite);
    }
  }, [weather.name]);

  const handleRestoreCity = () => {
    restoreCity(weather.name);
    showNotification('City Restored!', 'success', 3000);
    forceUpdate(prevValue => !prevValue);
  }

  const handleIsFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const userData = getUserData(weather.name);
    const notes = (userData && userData.notes) || '';
    saveUserData({ cityName: weather.name, isFavorite: checked, notes });
    setIsFavorite(checked);
    showNotification(checked ? 'Marked as favorite!' : 'Removed from favorites!', 'success', 2000);
  };

  const isCityRemoved = getRemovedCities().includes(weather.name);

  return (
    <div className="weather-header">
      <div className="title">
        <h1>{weather.title}</h1>
      </div>
      <div className="action">
        {
          isCityRemoved
            ? (
              <Button onClick={handleRestoreCity}>Restore</Button>
            )
            : (
              <Favorite
                name="favoriteCity"
                checked={isFavorite}
                onChange={handleIsFavoriteChange}
                label={isFavorite ? 'Remove from Favorites' : 'Mark as Favorite' }
              />
            )
        }
      </div>
    </div>
  )
}

export default WeatherHeader;