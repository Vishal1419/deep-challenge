import React, { FunctionComponent, ReactNode } from 'react';
import { compose } from 'recompose';
import cx from 'classnames';

import PageHeader from './PageHeader';
import PageContent from './PageContent';
import ErrorBoundary from '../ErrorBoundary';
import { withRouter } from 'react-router';

interface Props {
  className?: string;
  city?: string;
  children: ReactNode | ReactNode[];
  showHeaderBackButton?: boolean
}

interface EnhancedProps {
  match: {
    params: {
      cityName: string;
    }
  }
}

const Layout: FunctionComponent<Props & EnhancedProps> = ({
  className, city, children,
  showHeaderBackButton, match,
}) => (
  <div className={cx('layout', className)}>
    <ErrorBoundary>
      <PageHeader city={city} showBackButton={showHeaderBackButton} />
    </ErrorBoundary>
    <ErrorBoundary key={match.params.cityName}>
      <PageContent>
        {children}
      </PageContent>
    </ErrorBoundary>
  </div>
);

const EnhancedLayout = compose<Props & EnhancedProps, Props>(withRouter)(Layout);

export default EnhancedLayout;
