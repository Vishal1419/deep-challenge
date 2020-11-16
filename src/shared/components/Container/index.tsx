import React, { FunctionComponent, ReactNode } from 'react';

interface Props {
  children: ReactNode | ReactNode[]
}

const Container: FunctionComponent<Props> = ({ children }) => (
  <div className="container">
    {children}
  </div>
);

export default Container;
