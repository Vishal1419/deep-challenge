import React, { FunctionComponent } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import WeatherInfo from './pages/WeatherInfo';
import NotFound from './pages/NotFound';

const Routes: FunctionComponent = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/:cityName" render={(props) => <WeatherInfo key={props.match.params.id} {...props} />} />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>
);

export default Routes;