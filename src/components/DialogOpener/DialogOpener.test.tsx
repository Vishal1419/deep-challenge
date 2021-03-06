import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import Dialog from 'react-modal';

import DialogOpener from './index';

describe('component prop and children prop', () => {
  let container: HTMLElement;

  beforeEach(() => {
    const { container: _container } = render(
      <DialogOpener component={(open) => <button onClick={open}>Open Dialog</button>}>
        {(close) => <button onClick={close}>Dialog Content</button>}
      </DialogOpener>
    );
    container = _container;
  });

  it ('renders component prop correctly', () => {
    Dialog.setAppElement(container);
    expect(screen.getByText(/open dialog/i)).toBeInTheDocument();
  });

  it('opens dialog when component prop triggers open function', () => {
    Dialog.setAppElement(container);
    fireEvent.click(screen.getByText(/open dialog/i));
    expect(screen.getByText(/dialog content/i)).toBeInTheDocument();
  });

  it('renders children when dialog opens', () => {
    Dialog.setAppElement(container);
    expect(() => screen.getByText(/dialog content/i)).toThrow();
    fireEvent.click(screen.getByText(/open dialog/i));
    expect(screen.getByText(/dialog content/i)).toBeInTheDocument();
  });

  it('closes dialog when children trigger close function', () => {
    Dialog.setAppElement(container);
    fireEvent.click(screen.getByText(/open dialog/i));
    expect(screen.getByText(/dialog content/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/dialog content/i));
    expect(() => screen.getByText(/dialog content/i)).toThrow();
  });
});

it('adds dialogSize property value to dialog\'s class attribute', () => {
  const { container } = render(
    <DialogOpener
      component={(open) => <button onClick={open}>Open Dialog</button>}
      dialogSize="medium"
      className="dialog-test"
    >
      {() => 'Dialog Content'}
    </DialogOpener>
  );
  Dialog.setAppElement(container);
  fireEvent.click(screen.getByText(/open dialog/i));
  expect(document.querySelector('.dialog-test')).toHaveClass('medium');
});

it('sets dialogSize property default value to small', () => {
  const { container } = render(
    <DialogOpener
      component={(open) => <button onClick={open}>Open Dialog</button>}
      className="dialog-test"
    >
      {() => 'Dialog Content'}
    </DialogOpener>
  );
  Dialog.setAppElement(container);
  fireEvent.click(screen.getByText(/open dialog/i));
  expect(document.querySelector('.dialog-test')).toHaveClass('small');
});
