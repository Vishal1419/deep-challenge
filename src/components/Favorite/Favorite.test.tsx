import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import Favorite from './index';

it('renders label correctly', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite name="fav" label="Click me to favorite" checked onChange={handleFavoriteChange} />
  );
  expect(screen.getByText(/click me to favorite/i)).toBeInTheDocument();
});

it('attaches id to checkbox', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite id="fav-id" name="fav" checked onChange={handleFavoriteChange} />
  );
  expect(screen.getByTestId('checkbox')).toHaveAttribute('id', 'fav-id');
});

it('attaches name as id to checkbox when id is not passed in', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite name="fav" checked onChange={handleFavoriteChange} />
  );
  expect(screen.getByTestId('checkbox')).toHaveAttribute('id', 'fav');
});

it('attaches name to checkbox', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite name="fav" checked onChange={handleFavoriteChange} />
  );
  expect(screen.getByTestId('checkbox')).toHaveAttribute('name', 'fav');
});

it('sets default value of checkbox', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite name="fav" checked onChange={handleFavoriteChange} />
  );
  expect(screen.getByTestId('checkbox')).toHaveProperty('checked', true);
});

it('calls onChange when clicked', () => {
  const handleFavoriteChange = jest.fn();
  render(
    <Favorite
      name="fav"
      label="Click me to favorite"
      checked={false}
      onChange={handleFavoriteChange}
    />
  );
  fireEvent.click(screen.getByText(/click me to favorite/i));
  expect(handleFavoriteChange).toHaveBeenCalledTimes(1);
});
