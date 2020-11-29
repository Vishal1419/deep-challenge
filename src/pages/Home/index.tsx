import React, { FunctionComponent } from 'react';

import Home from './Home';
import Layout from '../../components/Layout';

const HomeContainer: FunctionComponent = () => (
  <Layout className="home-layout">
    <Home />
  </Layout>
);

export default HomeContainer;