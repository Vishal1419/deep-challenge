import React, { FunctionComponent, ReactNode } from 'react';
import BlockUI from 'react-block-ui';

interface Props {
  children: ReactNode | ReactNode[];
  loading: boolean;
  size?: number | string;
  renderChildren?: boolean;
};

const Loader: FunctionComponent<Props> = ({ children, loading, size = 50, renderChildren = true }) => (
  <BlockUI
    tag="div"
    className="loader"
    keepInView
    blocking={loading}
    renderChildren={renderChildren}
    loader={(
      <svg
        data-testid="spinner"
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="path"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          cx="33"
          cy="33"
          r="30"
        />
      </svg>
    )}
  >
    {children}
  </BlockUI>
);

export default Loader;
