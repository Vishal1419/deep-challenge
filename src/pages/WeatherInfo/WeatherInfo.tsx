import React, { FunctionComponent } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router';

import WeatherDetails from './WeatherDetails';
import UserDetails from './UserDetails';
import useWeather from '../../shared/useWeather';
import Loader from '../../components/Loader';
import { showNotification } from '../../shared/notifier';

interface Props {

}

interface EnhancedProps {
  match: {
    params: {
      cityName: string;
    }
  }
}

const WeatherInfo: FunctionComponent<Props & EnhancedProps> = ({ match }) => {
  const { cityName } = match.params;
  const response = useWeather({ cityName });
  const { weather, loading, error } = response;

  if (error) {
    showNotification(error.message, 'error');
  }

  if(!loading && !weather) {
    return <div className="no-data">No data available</div>
  }

  return (
    <Loader loading={loading} renderChildren={false}>
      <div className="weather-info">
        <div className="weather-info-title">
          <h1>
            {weather?.title}
          </h1>
        </div>
        <div className="weather-info-details">
          <section className="weather-details-container">
            <WeatherDetails weather={weather!} />
          </section>
          <section className="user-details-container">
            <UserDetails cityName={cityName} />
          </section>
        </div>
      </div>
    </Loader>
  );
};

const EnhancedWeatherInfo = compose<Props & EnhancedProps, Props>(withRouter)(WeatherInfo);

export default EnhancedWeatherInfo;
