import React, { FunctionComponent } from 'react';

import { ReactComponent as TemperatureIcon } from '../../assets/icons/temperature.svg';
import { ReactComponent as HumidityIcon } from '../../assets/icons/humidity.svg';
import { ReactComponent as PrecipitationIcon } from '../../assets/icons/precipitation.svg';
import { ReactComponent as CloudCoverIcon } from '../../assets/icons/cloud-cover.svg';
import { ReactComponent as PressureIcon } from '../../assets/icons/pressure.svg';
import { ReactComponent as UVIndexIcon } from '../../assets/icons/uv-index.svg';
import { ReactComponent as WindSpeedIcon } from '../../assets/icons/wind-speed.svg';
import { ReactComponent as WindDirectionIcon } from '../../assets/icons/wind-direction.svg';
import WeatherCard from '../../components/WeatherCard';
import { Weather } from '../../shared/interfaces';

interface Props {
  weather: Weather
}

const WeatherDetails: FunctionComponent<Props> = ({ weather }) => {
  const weatherInfo = [
    {
      Icon: <TemperatureIcon />,
      label: 'Temperature',
      value: '30°C',
    },
    {
      Icon: <HumidityIcon />,
      label: 'Humidity',
      value: (weather.humidity && `${weather.humidity}%`) || '0',
    },
    {
      Icon: <PrecipitationIcon />,
      label: 'Precipitation',
      value: (weather.precipitation && `${weather.precipitation}%`)  || '0',
    },
    {
      Icon: <CloudCoverIcon />,
      label: 'Cloud cover',
      value: '75%',
    },
    {
      Icon: <PressureIcon />,
      label: 'Pressure',
      value: '1011',
    },
    {
      Icon: <UVIndexIcon />,
      label: 'UV Index',
      value: '6',
    },
    {
      Icon: <WindSpeedIcon />,
      label: 'Wind Speed',
      value: '6km/h',
    },
    {
      Icon: <WindDirectionIcon />,
      label: 'Wind Direction',
      value: '350° N',
    },
  ];

  return (
    <div className="weather-details">
      {
        weatherInfo.map(info => (
          <WeatherCard {...info} />
          ))
      }
    </div>
  );
};

export default WeatherDetails; 
