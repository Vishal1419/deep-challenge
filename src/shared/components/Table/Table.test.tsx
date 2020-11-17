import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import Table, { TextAlign } from './index';

interface Item {
  id: number;
  name: string;
};

const handleRemoveClick = jest.fn();

const columns = [
  {
    header: 'Name',
    accessor: 'name',
    textAlign: 'center' as TextAlign,
  },
  {
    header: '',
    cell: ({ id }: Item) => <button onClick={handleRemoveClick}>{id}</button>,
    width: 50,
  }
];

const items: Item[] = [
  { id: 1, name: 'Kane' },
  { id: 2, name: 'Big Show' },
];

it('renders header', () => {
  const { container } = render(
    <Table columns={columns} items={items} />
  );
  expect(container.querySelectorAll('thead > tr')).toHaveLength(1);
});

it('renders number of table rows equals to number of items', () => {
  const { container } = render(
    <Table columns={columns} items={items} />
  );
  expect(container.querySelectorAll('tbody > tr')).toHaveLength(2);
});

it('renders number of table columns equals to number of columns', () => {
  const { container } = render(
    <Table columns={columns} items={items} />
  );
  expect(container.querySelectorAll('td')).toHaveLength(4);
});

it('evaluates header value', () => {
  const { getByText } = render(
    <Table columns={columns} items={items} />
  );
  expect(getByText('Name')).toBeInTheDocument();
});

it('evaluates accessor value', () => {
  const { getByText } = render(
    <Table columns={columns} items={items} />
  );
  expect(getByText('Kane')).toBeInTheDocument();
  expect(getByText('Big Show')).toBeInTheDocument();
});

it('evaluates cell value', () => {
  const { getByText } = render(
    <Table columns={columns} items={items} />
  );
  expect(getByText('1')).toBeInTheDocument();
  expect(getByText('2')).toBeInTheDocument();
});

it('sets width of column to a specified value', () => {
  const { getByText } = render(
    <Table columns={columns} items={items} />
  );
  expect(getByText('1')).toHaveStyle({ width: 50 });
  expect(getByText('2')).toHaveStyle({ width: 50 });
});

it('sets textAlign of column to a specified value', () => {
  const { getByText } = render(
    <Table columns={columns} items={items} />
  );
  expect(getByText('Name')).toHaveStyle({ textAlign: 'center' });
  expect(getByText('Kane')).toHaveStyle({ textAlign: 'center' });
  expect(getByText('Big Show')).toHaveStyle({ textAlign: 'center' });
});

it('sets class of the table element to a specified value', () => {
  const { getByTestId } = render(
    <Table columns={columns} items={items} className="hello" />
  );
  expect(getByTestId('table')).toHaveClass('hello');
});

it('shows loader when loading property is true', () => {
  const { container } = render(
    <Table columns={columns} items={items} loading />
  );
  expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
});

it('does not show loader when loading property is false', () => {
  const { container } = render(
    <Table columns={columns} items={items} loading={false} />
  );
  expect(container.firstChild).toHaveAttribute('aria-busy', 'false');
});

it('does not show loader when loading property is not supplied', () => {
  const { container } = render(
    <Table columns={columns} items={items} />
  );
  expect(container.firstChild).toHaveAttribute('aria-busy', 'false');
});

it('shows default no data message when noDataMessage is not passed in and number of items is 0', () => {
  const { getByText } = render(
    <Table columns={columns} items={[]} />
  );
  expect(getByText(/no data available/i)).toBeInTheDocument();
});

it('shows passed in noDataMessage when number of items is 0', () => {
  const { getByText } = render(
    <Table columns={columns} items={[]} noDataMessage="No data passed!" />
  );
  expect(getByText('No data passed!')).toBeInTheDocument();
});

it('sets sticky class on each cell of table header when stickyHeader is true', () => {
  const { container } = render(
    <Table columns={columns} items={[]} noDataMessage="No data passed!" />
  );
  const headerCells = container.querySelectorAll('th');
  headerCells.forEach((headerCell) => {
    expect(headerCell).not.toHaveClass('sticky');
  });
});

it('does not set sticky class on each cell of table header when stickyHeader is false', () => {
  const { container } = render(
    <Table columns={columns} items={[]} noDataMessage="No data passed!" />
  );
  const headerCells = container.querySelectorAll('th');
  headerCells.forEach((headerCell) => {
    expect(headerCell).not.toHaveClass('sticky');
  });
});
