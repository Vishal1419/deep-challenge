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
      value: `${weather.temperature}°C`,
    },
    {
      Icon: <HumidityIcon />,
      label: 'Humidity',
      value: `${weather.humidity}%`,
    },
    {
      Icon: <PrecipitationIcon />,
      label: 'Precipitation',
      value: `${weather.precipitation}%`,
    },
    {
      Icon: <CloudCoverIcon />,
      label: 'Cloud Cover',
      value: `${weather.cloudCover}%`,
    },
    {
      Icon: <PressureIcon />,
      label: 'Pressure',
      value: `${weather.pressure} Pa`,
    },
    {
      Icon: <UVIndexIcon />,
      label: 'UV Index',
      value: `${weather.uvIndex}`,
    },
    {
      Icon: <WindSpeedIcon />,
      label: 'Wind Speed',
      value: `${weather.windSpeed} km/h`,
    },
    {
      Icon: <WindDirectionIcon />,
      label: 'Wind Direction',
      value: `${weather.windDegree}° ${weather.windDirection}`,
    },
  ];

  return (
    <div className="weather-details">
      {
        weatherInfo.map(info => (
          <WeatherCard key={info.label} {...info} />
        ))
      }
    </div>
  );
};

export default WeatherDetails; 
