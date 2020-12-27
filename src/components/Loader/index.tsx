import React, { FunctionComponent, ReactNode } from 'react';
import BlockUI from 'react-block-ui';

interface Props {
  children: ReactNode | ReactNode[];
  loading: boolean;
  hideLoader?: boolean;
  size?: number | string;
  renderChildren?: boolean;
  message?: string;
  [x: string]: unknown;
};

const Loader: FunctionComponent<Props> = ({ children, loading, hideLoader = false, size = 50, renderChildren = true, message = '', ...rest }) => (
  <BlockUI
    {...rest}
    tag="div"
    className="loader"
    keepInView
    blocking={loading}
    renderChildren={renderChildren}
    loader={(
      <div className="spinner-container">
        {
          !hideLoader && (
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
          )
        }
        <span className="spinner-message">{message}</span>
      </div>
    )}
  >
    {children}
  </BlockUI>
);

export default Loader;
