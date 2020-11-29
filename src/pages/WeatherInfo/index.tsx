import React, { FunctionComponent } from 'react';

import WeatherInfo from './WeatherInfo';
import Layout from '../../components/Layout';

const WeatherInfoContainer: FunctionComponent = () => (
  <Layout className="weather-info-layout" showHeaderBackButton>
    <WeatherInfo />
  </Layout>
)

export default WeatherInfoContainer; 