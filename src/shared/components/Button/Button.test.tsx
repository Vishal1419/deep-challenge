import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Button from './index';

it ('renders correctly', () => {
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
  const { container } = render(
    <Button type="submit" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(container.firstChild).toHaveAttribute('type', 'submit');
});

it('attaches variant as className', () => {
  const handleClick = jest.fn();
  const { container } = render(
    <Button variant="outlined" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(container.firstChild).toHaveClass('outlined');
  expect(container.firstChild).not.toHaveClass('contained');
  expect(container.firstChild).not.toHaveClass('text');
});

it('sets className correctly', () => {
  const handleClick = jest.fn();
  const { container } = render(
    <Button className="click-me" onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(container.firstChild).toHaveClass('click-me');
});

it('sets disabled prop', () => {
  const handleClick = jest.fn();
  const { container } = render(
    <Button disabled onClick={handleClick}>
      Click Me!
    </Button>
  );
  expect(container.firstChild).toHaveAttribute('disabled', '');
});
