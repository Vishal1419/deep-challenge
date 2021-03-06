import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import Button from './index';

it ('renders children correctly', () => {
  const handleClick = jest.fn();
  render(
    <Button onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toBeInTheDocument();
});

it('calls onClick prop when clicked', () => {
  const handleClick = jest.fn();
  render(
    <Button onClick={handleClick}>
      Click Me!
    </Button>
  );
  fireEvent.click(screen.getByText(/click me/i));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

it('sets type correctly', () => {
  const handleClick = jest.fn();
  render(
    <Button type="submit" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toHaveAttribute('type', 'submit');
});

it('sets default value for type when type is not passed in', () => {
  const handleClick = jest.fn();
  render(
    <Button onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toHaveAttribute('type', 'button');
})

it('attaches variant as className', () => {
  const handleClick = jest.fn();
  render(
    <Button variant="outlined" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toHaveClass('outlined');
  expect(screen.getByText(/click me/i)).not.toHaveClass('contained');
  expect(screen.getByText(/click me/i)).not.toHaveClass('text');
});

it('attaches default variant as className when variant is not passed in', () => {
  const handleClick = jest.fn();
  render(
    <Button onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toHaveClass('contained');
  expect(screen.getByText(/click me/i)).not.toHaveClass('outlined');
  expect(screen.getByText(/click me/i)).not.toHaveClass('text');
});

it('sets className correctly', () => {
  const handleClick = jest.fn();
  render(
    <Button className="click-me" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toHaveClass('click-me');
});

it('sets disabled prop', () => {
  const handleClick = jest.fn();
  render(
    <Button disabled onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(screen.getByText(/click me/i)).toBeDisabled();
});
