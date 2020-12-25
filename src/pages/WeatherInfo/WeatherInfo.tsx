import React, { FunctionComponent } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router';

import WeatherHeader from './WeatherHeader';
import WeatherDetails from './WeatherDetails';
import NotesSection from './NotesSection';
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
  const { weatherCollection, isLoading, isError, error } = useWeather({ cityNames: [cityName] });

  if (isError) {
    showNotification(error.message, 'error');
  }

  if(!isLoading && weatherCollection.length === 0) {
    return <div className="no-data">No data available</div>
  }

  return (
    <Loader loading={isLoading} renderChildren={false} data-testid="weather-loader">
      <div className="weather-info">
        <WeatherHeader weather={weatherCollection[0]} />
        <div className="weather-info-content">
          <section className="weather-details-container">
            <WeatherDetails weather={weatherCollection[0]} />
          </section>
          <section className="notes-section-container">
            <NotesSection cityName={cityName} />
          </section>
        </div>
      </div>
    </Loader>
  );
};

const EnhancedWeatherInfo = compose<Props & EnhancedProps, Props>(withRouter)(WeatherInfo);

export default EnhancedWeatherInfo;