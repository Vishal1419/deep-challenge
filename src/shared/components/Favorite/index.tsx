import React, { FunctionComponent, ReactNode } from 'react';
import cx from 'classnames';

import { ReactComponent as HeartIcon } from '../../../assets/icons/heart.svg';

interface Props {
  id?: string;
  name: string;
  label?: ReactNode;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const Favorite: FunctionComponent<Props> = ({
  id, name, label,
  checked, onChange,
}) => (
  <>
    <label htmlFor={id || name} className="favorite-container">
      <input
        data-testid="checkbox"
        id={id || name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <div className="favorite-visuals">
        <span className="favorite-label">{label}</span>
        <HeartIcon className={cx('icon', { checked })} />
      </div>
    </label>
  </>
);

export default Favorite;
