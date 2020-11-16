import React, { FunctionComponent, ReactNode } from 'react';
import cx from 'classnames';

interface Props {
  children: ReactNode,
  onClick: React.MouseEventHandler,
  type?: 'button' | 'submit' | 'reset',
  variant?: 'contained' | 'outlined' | 'text',
  className?: string,
  disabled?: boolean,
};

const Button: FunctionComponent<Props> = ({
  children, onClick, type = 'button',
  variant = 'contained', className, disabled,
}) => (
  <button
    type={type}
    className={cx('button', className, variant)}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;
