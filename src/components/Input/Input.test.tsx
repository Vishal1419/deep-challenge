import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import Input from './index';

it('sets type on input', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="password" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  expect(() => screen.getByTestId('textarea')).toThrow();
});

it('renders textarea when type is textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toBeInTheDocument();
  expect(() => screen.getByTestId('input')).toThrow();
});

it ('defaults type to text when type is not passed as a prop', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');
  expect(() => screen.getByTestId('textarea')).toThrow();
});

it('sets id on input', () => {
  const handleChange = jest.fn();
  render(
    <Input id="notes-id" name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('id', 'notes-id');
});

it('sets id on textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input id="notes-id" name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveAttribute('id', 'notes-id');
});

it('defaults id of input to name if not provided', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('id', 'notes-name');
});

it('defaults id of textarea to name if not provided', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveAttribute('id', 'notes-name');
});

it('sets name on input', () => {
  const handleChange = jest.fn();
  render(
    <Input id="notes-id" name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('name', 'notes-name');
});

it('sets name on textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input id="notes-id" name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveAttribute('name', 'notes-name');
});

it('renders label when passed as props', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" label="Notes Label" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByText(/notes label/i)).toBeInTheDocument();
});

it('sets class on input when className is passed', () => {
  const handleChange = jest.fn();
  render(
    <Input className="notes-class" name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveClass('notes-class');
});

it('sets class on textarea when className is passed', () => {
  const handleChange = jest.fn();
  render(
    <Input type="textarea" className="notes-class" name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveClass('notes-class');
});

it('sets value attribute on input', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).toHaveAttribute('value', 'some notes');
});

it('sets value attribute on textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveTextContent('some notes');
});

it('calls onChange props when user types on input', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" value="some notes" onChange={handleChange} />
  );
  fireEvent.change(screen.getByTestId('input'), { target: { value: 'abcd' } });
  expect(handleChange).toHaveBeenCalledTimes(1);
});

it('calls onChange props when user types on textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  fireEvent.change(screen.getByTestId('textarea'), { target: { value: 'abcd' } });
  expect(handleChange).toHaveBeenCalledTimes(1);
});

it('sets rows property of textarea', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" rows={10} value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '10');
});

it('defaults rows property of textarea to 4', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" type="textarea" value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('textarea')).toHaveAttribute('rows', '4');
});

it('does not make any changes to input regarding rows property', () => {
  const handleChange = jest.fn();
  render(
    <Input name="notes-name" rows={10} value="some notes" onChange={handleChange} />
  );
  expect(screen.getByTestId('input')).not.toHaveAttribute('rows');
});
