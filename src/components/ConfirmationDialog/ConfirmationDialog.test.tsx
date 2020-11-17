import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'

import ConfirmationDialog from './index';

let handleCancel: jest.Mock<any, any> | null;
let handleConfirm: jest.Mock<any, any> | null;

beforeEach(() => {
  handleCancel = jest.fn();
  handleConfirm = jest.fn();
  render(
    <ConfirmationDialog
      title="Are you sure?"
      onCancel={() => handleCancel && handleCancel()}
      onConfirm={() => handleConfirm && handleConfirm()}
    >
      Really, delete this element?
    </ConfirmationDialog>
  )
});

afterEach(() => {
  handleCancel = null;
  handleConfirm = null;
})

it ('renders title prop', () => {
  expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
});

it('renders children prop', () => {
  expect(screen.getByText(/delete this element/i)).toBeInTheDocument();
});

it('calls onCancel when cancel button is clicked', () => {
  fireEvent.click(screen.getByText(/cancel/i));
  expect(handleCancel).toBeCalledTimes(1);
});

it('calls onConfirm when confirm button is clicked', () => {
  fireEvent.click(screen.getByText(/confirm/i));
  expect(handleConfirm).toBeCalledTimes(1);
});
