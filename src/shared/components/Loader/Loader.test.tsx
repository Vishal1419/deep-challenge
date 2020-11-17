import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import Loader from './index';

it('renders loader when loading is true', () => {
  render(
    <Loader loading>
      Some Content
    </Loader>
  );
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'true');
});

it('does not render loader when loading is false', () => {
  render(
    <Loader loading={false}>
      Some Content
    </Loader>
  );
  expect(document.querySelector('.loader')).toHaveAttribute('aria-busy', 'false');
});

it('renders children when loading is true', () => {
  render(
    <Loader loading>
      Some Content
    </Loader>
  );
  expect(screen.getByText(/some content/i)).toBeInTheDocument();
});

it('renders children when loading is false', () => {
  render(
    <Loader loading={false}>
      Some Content
    </Loader>
  );
  expect(screen.getByText(/some content/i)).toBeInTheDocument();
});

it('renders children when loading is true and renderChildren is true', () => {
  render(
    <Loader loading renderChildren>
      Some Content
    </Loader>
  );
  expect(screen.getByText(/some content/i)).toBeInTheDocument();
});

it('renders children when loading is false and renderChildren is true', () => {
  render(
    <Loader loading={false} renderChildren>
      Some Content
    </Loader>
  );
  expect(screen.getByText(/some content/i)).toBeInTheDocument();
});

it('does not render children when loading is true and renderChildren is false', () => {
  render(
    <Loader loading renderChildren={false}>
      Some Content
    </Loader>
  );
  expect(() => screen.getByText(/some content/i)).toThrow();
});

it('renders children when loading is false and renderChildren is false', () => {
  render(
    <Loader loading={false} renderChildren={false}>
      Some Content
    </Loader>
  );
  expect(screen.getByText(/some content/i)).toBeInTheDocument();
});

it('sets spinner height and width equal to size', () => {
  render(
    <Loader loading size={10}>
      Some Content
    </Loader>
  );
  expect(screen.getByTestId('spinner')).toHaveAttribute('height', '10');
  expect(screen.getByTestId('spinner')).toHaveAttribute('width', '10');
});
