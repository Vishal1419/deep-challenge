import React, { FunctionComponent, ReactNode } from 'react';
import cx from 'classnames';

interface Props {
  id?: string;
  name: string;
  label?: ReactNode;
  type?: 'text' | 'number' | 'email' | 'password' | 'textarea';
  className?: string;
  value: string;
  onChange: React.ChangeEventHandler;
  rows?: number;
}

const Input: FunctionComponent<Props> = ({
  id, name, label, type = 'text',
  className, value, onChange, rows = 4
}) => (
  <label className="textbox-container" htmlFor={id || name}>
    {label && <span className="label-text">{label}</span>}
    {
      type === 'textarea'
        ? (
          <textarea
            data-testid="textarea"
            id={id || name}
            name={name}
            className={cx('textbox', className)}
            value={value}
            onChange={onChange}
            rows={rows}
          />
        )
        : (
          <input
            data-testid="input"
            id={id || name}
            name={name}
            type={type}
            className={cx('textbox', className)}
            value={value}
            onChange={onChange}
          />
        )
    }
  </label>
);

export default Input;
