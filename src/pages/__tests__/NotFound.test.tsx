import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import NotFound from '../NotFound';

beforeEach(() => {
  render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>
  );
})
it('should render 404 text', () => {
  expect(screen.getByText('404')).toBeInTheDocument();
});

it('should render information text', () => {
  expect(screen.getByText(/this is not the page/i)).toBeInTheDocument();
});

it('should render link to Home Page', () => {
  expect(screen.getByText(/home/i)).toBeInTheDocument();
});

it('should render link to Home Page and take the user to home page', () => {
  expect(screen.getByText(/home/i)).toHaveAttribute('href', '/');
});