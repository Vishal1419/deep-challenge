import React, { FunctionComponent, ReactNode } from 'react';

interface Props {
  children: ReactNode | ReactNode[];
};

const PageContent: FunctionComponent<Props> = ({ children }) => (
  <section className="page-content">
    {children}
  </section>
);

export default PageContent;