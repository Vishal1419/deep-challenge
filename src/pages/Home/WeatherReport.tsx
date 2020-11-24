import React, { FunctionComponent, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Table, { TextAlign } from '../../components/Table';
import DialogOpener, { CloseFunction, OpenFunction } from '../../components/DialogOpener';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Button from '../../components/Button';
import { CityWeather } from '../../shared/interfaces';
import { getRemovedCities, removeCity, restoreCity } from '../../shared/actions';
import { showNotification } from '../../shared/notifier';
import { ReactComponent as HeartIcon } from '../../assets/icons/heart.svg';

export interface EnhancedCityWeather extends CityWeather {
  isFavorite: boolean;
}

interface Props {
  cityWeatherCollection: EnhancedCityWeather[];
  loading?: boolean
  rerender?: () => void;
};

const WeatherReport: FunctionComponent<Props> = ({ cityWeatherCollection, loading, rerender }) => {
  const [items, setItems] = useState(cityWeatherCollection);
  const [sortedItems, setSortedItems] = useState<EnhancedCityWeather[]>([]);
  const [, forceUpdate] = useState(false);

  useEffect(() => {
    setItems(cityWeatherCollection);
  }, [cityWeatherCollection]);
  
  useEffect(() => {
    if (!loading && items.filter(item => !item.isFavorite).length === 0 && rerender) rerender();
  }, [items.length, loading, rerender]);

  useEffect(() => {
    const _sortedItems = items.sort((item1, item2) =>
      +item2.isFavorite - +item1.isFavorite
      || item1.name.localeCompare(item2.name)
    );
    setSortedItems(_sortedItems);
  }, [items]);

  const handleRestoreCity = (name: string) => {
    restoreCity(name);
    forceUpdate(prevValue => !prevValue);
    showNotification('City restored!');
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
      cell: ({ name, title }: EnhancedCityWeather) => <Link to={`/${name}`} className="city">{title}</Link>
    },
    {
      header: 'Temp',
      cell: ({ temperature }: EnhancedCityWeather) => (
        <div className="temperature">
          <span className="celcius">{`${temperature}°C`}</span>
          <span className="fahrenheit">{` (~${Math.round(temperature * (9 / 5)) + 32}°F)`}</span>
        </div>
      )
    },
    {
      header: '',
      cell: ({ isFavorite } : EnhancedCityWeather) => isFavorite && (
        <HeartIcon
          data-testid="HeartIcon"
          fill="#6d3fdf"
          height={20}
          width={20}
        />
      ),
    },
    {
      header: '',
      cell: ({ name, title, isFavorite }: EnhancedCityWeather) => {
        if(isFavorite && getRemovedCities().find(item => item === name)) {
          return <Button onClick={() => handleRestoreCity(name)}>Restore</Button>;
        }

        if(!isFavorite) {
          return (
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
          );
        }
      },
      textAlign: 'right' as TextAlign,
    }
  ];

  return (
    <Table columns={columns} items={sortedItems} loading={loading} />
  );
};

export default WeatherReport;
