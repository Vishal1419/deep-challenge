import React, { FunctionComponent, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import Select, { ValueType } from 'react-select';
import { useDebounce } from 'use-debounce';
import { compose } from 'recompose';
import { Detector } from 'react-detect-offline';

import { ReactComponent as ChevronRightIcon } from '../../assets/icons/chevron-right.svg';
import useCity from '../../shared/useCity';
import { uniqBy } from '../../shared/utils';

interface Props {
  showBackButton?: boolean;
}

interface EnhancedProps {
  history: {
    push: Function;
  }
}

interface Option {
  label: string;
  value: string;
}

const PageHeader: FunctionComponent<Props & EnhancedProps> = ({ showBackButton = false, history }) => {
  const [selectedCity] = useState<ValueType<Option>>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { cities, isLoading } = useCity({ rows: 10, query: debouncedSearchTerm[0], enabled: !!debouncedSearchTerm[0] });
  const options = uniqBy(cities.map(city => ({ value: city.name, label: city.title })), 'value');

  const selectCity = (_city: ValueType<Option>) => {
    history.push(`/${Object(_city).value}`);
  }

  return (
    <section className="page-header">
      <div className="left">
        {
          showBackButton && (
            <div className="back">
              <ChevronRightIcon className="back-icon" />
              <Link to="/" className="link">Back to Home</Link>
            </div>
          )
        }
        <h1>
          Weather Report
        </h1>
      </div>
      <div className="right">
        <Detector
          render={({ online }) => (
            <Select
              onInputChange={setSearchTerm}
              options={options}
              isLoading={isLoading || searchTerm !== debouncedSearchTerm[0]}
              className="react-select"
              classNamePrefix="react-select"
              value={selectedCity}
              onChange={selectCity}
              placeholder="Search..."
              noOptionsMessage={({ inputValue }) => {
                if(inputValue) {
                  if (!online) {
                    return `You are offline, No match found for ${inputValue} in cache`
                  }
                  return `No match found for ${inputValue}`
                }
                return 'Start typing to search'
              }}
            />
          )}
        />
      </div>
    </section>
  );
};

const EnhancedPageHeader = compose<Props & EnhancedProps, Props>(withRouter)(PageHeader);

export default EnhancedPageHeader;
