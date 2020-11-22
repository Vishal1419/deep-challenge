import React, { FunctionComponent } from 'react';
import { Weather } from '../../shared/interfaces';

interface Props {
  weather: Weather | undefined
}

const WeatherDetails: FunctionComponent<Props> = ({ weather }) => {
  const weatherInfo = [
    {
      label: 'Precipitation',
      value: weather?.precipitation && `${weather?.precipitation}%`,
    },
    {
      label: 'Humidity',
      value: weather?.humidity && `${weather?.humidity}%`,
    },
    {
      label: 'Wind',
      value: weather?.windSpeed && `${weather?.windSpeed} km/h`,
    },
  ];

  return (
    <div className="weather-details">
      <div className="title">
        <img src={weather?.imageSource} alt="" />
        <span className="temperature">
          {weather?.temperature}
          <sup>°C</sup>
        </span>
      </div>
      <div className="info">
        <table>
          <tbody>
            {
              weatherInfo.map(item => (
                <tr key={item.label}>
                  <td className="label">{item.label}</td>
                  <td className="value">{item.value}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeatherDetails;