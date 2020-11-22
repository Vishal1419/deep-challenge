import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import { ToastContainer } from 'react-toastify';

import { dismissNotification, showNotification } from './index';

it('renders notification text', async () => {
  render(<ToastContainer />);
  showNotification('Test Notification');
  await waitFor(() => {
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });
});

it('passes type into toast', async () => {
  render(<ToastContainer />)
  showNotification('Test Notification', 'error');
  await waitFor(() => {
    expect(screen.getByText('Test Notification').parentElement).toHaveClass('Toastify__toast--error');
  });
});

it('sets success as default type into toast', async () => {
  render(<ToastContainer />)
  showNotification('Test Notification');
  await waitFor(() => {
    expect(screen.getByText('Test Notification').parentElement).toHaveClass('Toastify__toast--success');
  });
});

it('passes timeout to autoClose property of toast', async () => {
  render(<ToastContainer />)
  showNotification('Test Notification', 'success', 2000);
  await waitFor(() => {
    expect(screen.getByText('Test Notification').nextSibling?.nextSibling).toHaveStyle({ animationDuration: '2000ms' });
  });
});

it('sets default timeout to 5000ms', async () => {
  render(<ToastContainer />)
  showNotification('Test Notification');
  await waitFor(() => {
    expect(screen.getByText('Test Notification').nextSibling?.nextSibling).toHaveStyle({ animationDuration: '5000ms' });
  });
});


it('dismisses notification when called', async () => {
  render(<ToastContainer />);
  const notificationId = showNotification('Test Notification', 'success', 10000);
  await waitFor(() => {
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });
  dismissNotification(notificationId);
  await waitForElementToBeRemoved(screen.queryByText('Test Notification'), { timeout: 2000 });
  expect(screen.queryByText('Test Notification')).not.toBeInTheDocument();
});
