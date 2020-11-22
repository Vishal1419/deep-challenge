import React, { FunctionComponent } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router';

import WeatherDetails from './WeatherDetails';
import UserDetails from './UserDetails';
import useWeather from '../../shared/useWeather';
import Loader from '../../components/Loader';

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
  const { weather, loading, error } = useWeather({ cityName });

  if (error) {
    throw new Error('custom::Sorry, weather data for this city is not available!');
  }

  if(!loading && !weather) {
    return <div className="no-data">No data available</div>
  }

  return (
    <Loader loading={loading}>
      <div className="weather-info">
        <section className="weather-details-container">
          <WeatherDetails weather={weather!} />
        </section>
        <section className="user-details-container">
          <UserDetails cityName={cityName} />
        </section>
      </div>
    </Loader>
  );
};

const EnhancedWeatherInfo = compose<Props & EnhancedProps, Props>(withRouter)(WeatherInfo);

export default EnhancedWeatherInfo;
