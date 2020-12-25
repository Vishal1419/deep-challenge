import React, { FunctionComponent } from 'react';

import WeatherInfo from './WeatherInfo';
import Layout from '../../components/Layout';

const WeatherInfoContainer: FunctionComponent = () => (
  <Layout className="weather-info-layout" showHeaderBackButton>
    {(isFetchingLocation) => <WeatherInfo isFetchingLocation={isFetchingLocation} />}
  </Layout>
)

export default WeatherInfoContainer; 