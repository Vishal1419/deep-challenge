import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';

import PageHeader from './PageHeader';
import { BASE_URL } from '../../config';

let cities = {
  records: [
    { fields: { city: 'ahmedabad', accentcity: 'Ahmedabad' } },
    { fields: { city: 'ajmer', accentcity: 'Ajmer' } },
    { fields: { city: 'akita', accentcity: 'Akita' } },
    { fields: { city: 'allahabad', accentcity: 'Allahabad' } },
    { fields: { city: 'azua', accentcity: 'Azua' } },
  ],
};

let expectedData = [
  { city: 'ahmedabad', accentcity: 'Ahmedabad' },
  { city: 'ajmer', accentcity: 'Ajmer' },
  { city: 'akita', accentcity: 'Akita' },
  { city: 'allahabad', accentcity: 'Allahabad' },
  { city: 'azua', accentcity: 'Azua' },
];

const server = setupServer(
  rest.get(BASE_URL.CITIES_SERVICE, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(cities),
    );
  }),
  rest.get('*', (req, res, ctx) => {
    const error = `Please add request handler for ${req.url.toString()}`;
    console.error(error);
    return res(
      ctx.status(500),
      ctx.json({ error }),
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
afterAll(() => server.close());

const renderPageHeader = (showBackButton?: boolean) => {
  render(
    <BrowserRouter>
      <PageHeader showBackButton={showBackButton} />
    </BrowserRouter>
  );
};

it('should show page heading', () => {
  renderPageHeader();
  expect(screen.getByText(/weather report/i)).toBeInTheDocument();
});

it('should not show home link when showBackButton prop is not passed in', () => {
  renderPageHeader();
  expect(screen.queryByText(/back to home/i)).not.toBeInTheDocument();
});

it('should not show home link when showBackButton prop is false', () => {
  renderPageHeader(false);
  expect(screen.queryByText(/back to home/i)).not.toBeInTheDocument();
});

it('should show home link when showBackButton prop is true', () => {
  renderPageHeader(true);
  expect(screen.getByText(/back to home/i)).toBeInTheDocument();
});

it('should show autocomplete with placeholder of search', () => {
  renderPageHeader();
  expect(screen.getByText(/search/i)).toBeInTheDocument();
});

it('should show cities when user types in select input', async () => {
  renderPageHeader();
  const selectInput = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.focus(selectInput);
  fireEvent.change(selectInput, { target: { value: 'a' }});

  await waitFor(() => {
    screen.getByText(expectedData[0].accentcity)
  });

  expectedData.forEach(async (city) => {
    expect(screen.getByText(city.accentcity)).toBeInTheDocument();
  });
});

it('should navigate user to another route on select\'s value change', async () => {
  renderPageHeader();
  const selectInput = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.focus(selectInput);
  fireEvent.change(selectInput, { target: { value: 'a' }});

  await waitFor(() => {
    screen.getByText(expectedData[0].accentcity)
  });

  const firstOption = screen.getByText(expectedData[0].accentcity);
  expect(firstOption).toBeInTheDocument();
  fireEvent.click(firstOption);
  expect(window.location.pathname).toEqual(`/${expectedData[0].city}`);
});

it('should clear select input on blur', async () => {
  renderPageHeader();
  const selectInput = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.focus(selectInput);
  fireEvent.change(selectInput, { target: { value: 'a' }});
  fireEvent.blur(selectInput);
  expect(selectInput.value).toEqual('');
});
