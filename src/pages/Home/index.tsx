import React, { FunctionComponent } from 'react';

import Home from './Home';
import Layout from '../../components/Layout';

const HomeContainer: FunctionComponent = () => (
  <Layout className="home-layout">
    {(isFetchingLocation) => <Home isFetchingLocation={isFetchingLocation} />}
  </Layout>
);

export default HomeContainer;