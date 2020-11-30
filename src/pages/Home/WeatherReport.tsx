import React, { FunctionComponent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Detector } from 'react-detect-offline';

import Favorite from '../../components/Favorite';
import Button from '../../components/Button';
import DialogOpener, { OpenFunction, CloseFunction } from '../../components/DialogOpener';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Table, { TextAlign } from '../../components/Table';
import { Weather } from '../../shared/interfaces';
import { getFavorites, removeCity, saveUserData } from '../../shared/actions';
import { showNotification } from '../../shared/notifier';

interface Props {
  weatherCollection: Weather[];
  loading: boolean;
  handleFetchNewCities?: () => void;
}

export interface EnhancedWeather extends Weather {
  isFavorite: boolean;
}

const sortItems = (items: Weather[]) => {
  const favoriteCities = getFavorites();
  const sortedItems = items
    .map(item => {
      const favoriteCity = favoriteCities.find(city => city.cityName === item.name);
      const isFavorite = !!favoriteCity?.isFavorite;
      return {
        ...item,
        isFavorite,
      };
    })
    .sort((item1, item2) =>
      +item2.isFavorite - +item1.isFavorite
      || item1.name.localeCompare(item2.name)
    );
  return sortedItems;
}

const WeatherReport: FunctionComponent<Props> = ({
  weatherCollection,
  loading,
  handleFetchNewCities = () => {},
}) => {
  const [items, setItems] = useState(weatherCollection);
  const [sortedItems, setSortedItems] = useState<EnhancedWeather[]>([]);

  useEffect(() => {
    setItems(weatherCollection);
  }, [weatherCollection]);

  useEffect(() => {
    const _sortedItems = sortItems(items);
    setSortedItems(_sortedItems);
  }, [items]);

  const handleIsFavoriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const favoriteCities = getFavorites();
    const notes = favoriteCities.find(city => city.cityName === name)?.notes || '';
    saveUserData({ cityName: name, isFavorite: checked, notes });
    showNotification(checked ? 'Marked as favorite!' : 'Removed from favorites!', 'success', 2000);
    const _sortedItems = sortItems(items);
    setSortedItems(_sortedItems);
  };

  const handleRemoveCity = (close: CloseFunction, name: string) => {
    removeCity(name);
    setItems(prevValue => [...prevValue.filter(item => item.name !== name)]);
    showNotification('City removed!');
    close();
  };

  const columns = [
    {
      header: 'City',
      cell: ({ name, title }: EnhancedWeather) => <Link to={`/${name}`} className="city">{title}</Link>
    },
    {
      header: 'Temp',
      cell: ({ temperature }: EnhancedWeather) => (
        <div className="temperature">
          <span className="celcius">{`${temperature}°C`}</span>
          <span className="fahrenheit">{` (~${Math.round(temperature * (9 / 5)) + 32}°F)`}</span>
        </div>
      )
    },
    {
      header: '',
      cell: ({ name, isFavorite }: EnhancedWeather) => (
        <Favorite
          name={name}
          checked={isFavorite}
          onChange={handleIsFavoriteChange}
        />
      )
    },
    {
      header: '',
      cell: ({ name, title }: EnhancedWeather) => (
        <DialogOpener
          component={(open: OpenFunction) => 
            <Button variant="text" onClick={() => open()}>Remove</Button>
          }
        >
          {
            (close: CloseFunction) => (
              <ConfirmationDialog
                title="Are you sure?"
                onCancel={() => close()}
                onConfirm={() => handleRemoveCity(close, name)}
              >
                {`This operation will delete ${title} from Weather Report. \n Are you sure you want to delete it?`}
              </ConfirmationDialog>
            )
          }
        </DialogOpener>
      ),
      textAlign: 'right' as TextAlign,
    },
  ];

  if(!loading && items.length === 0) {
    return (
      <div className="no-data">
        <span>You have removed all the cities.</span>
        <Detector render={({ online }) => (
          <Button onClick={handleFetchNewCities} disabled={!online}>
            Fetch new cities
          </Button>
        )} />
      </div>
    );
  }

  return (
    <Table columns={columns} items={sortedItems} />
  ); 
};

export default WeatherReport;