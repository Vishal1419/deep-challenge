import React, { FunctionComponent, ReactNode } from 'react';
import { compose } from 'recompose';
import cx from 'classnames';
import { withRouter } from 'react-router';

import Loader from '../Loader';
import Container from '../Container';
import PageHeader from './PageHeader';
import PageContent from './PageContent';
import ErrorBoundary from '../ErrorBoundary';
import useGeoLocation from '../../shared/useGeoLocation';
import useWeather from '../../shared/useWeather';
import { showNotification } from '../../shared/notifier';

interface Props {
  className?: string;
  children: (fetchingLocation: boolean) => ReactNode | ReactNode[];
  showHeaderBackButton?: boolean
}

interface EnhancedProps {
  match: {
    params: {
      cityName: string;
    }
  },
  history: {
    push: (path: string) => void
  }
}

const Layout: FunctionComponent<Props & EnhancedProps> = ({
  className, children,
  showHeaderBackButton, match, history,
}) => {
  const { cityName } = match.params;
  const mySavedCityName = localStorage.getItem('my-location');
  const { loading, coords } = useGeoLocation({ isEnabled: cityName !== mySavedCityName });
  
  const {
    weatherCollection, isError, error: WeatherError,
  } = useWeather({ cityNames: coords ? [`${coords.latitude},${coords.longitude}`] : [] });
  
  if (isError) {
    showNotification(WeatherError.message, 'error');
  }
  
  const myCityName = weatherCollection[0] && weatherCollection[0].title.toLowerCase();
  if (myCityName && cityName !== myCityName) {
    localStorage.setItem('my-location', myCityName);
    history.push(`/${myCityName}`);
  }

  return (
    <Loader loading={loading} message="Fetching your location...">
      <Container>
        <div className={cx('layout', className)}>
          <ErrorBoundary>
            <PageHeader showBackButton={showHeaderBackButton} />
          </ErrorBoundary>
          <ErrorBoundary key={match.params.cityName}>
            <PageContent>
              {children(loading)}
            </PageContent>
          </ErrorBoundary>
        </div>
      </Container>
    </Loader>
  );
};

const EnhancedLayout = compose<Props & EnhancedProps, Props>(withRouter)(Layout);

export default EnhancedLayout;
