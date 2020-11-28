import React, { FunctionComponent, useState } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { ValueType } from 'react-select';
import AsyncSelect from 'react-select/async';
import debounce from 'debounce-promise';
import { compose } from 'recompose';

import { ReactComponent as ChevronRightIcon } from '../../assets/icons/chevron-right.svg';
import { uniqBy } from '../../shared/utils';
import { showNotification } from '../../shared/notifier';
import { BASE_URL } from '../../config';

interface Props {
  showBackButton?: boolean;
}

interface EnhancedProps {
  history: {
    push: Function;
  }
}

interface CitiesResponse {
  records: {
    fields: {
      city: string;
      accentcity: string;
    }
  }[]
}

interface Option {
  label: string;
  value: string;
}

const PageHeader: FunctionComponent<Props & EnhancedProps> = ({ showBackButton = false, history }) => {
  const [selectedCity, setSelectedCity] = useState<ValueType<Option>>(null);

  const loadCities = debounce(
    async (input: string) => {
      try {
        const cities = await fetch(`${BASE_URL.CITIES_SERVICE}?dataset=worldcitiespop&rows=10&q=${input}`);
        const citiesJson: CitiesResponse = await cities.json();
        const _cities = citiesJson.records.map(record => ({ label: record.fields.accentcity, value: record.fields.city }));
        return new Promise<Option[]>((resolve) => resolve(uniqBy(_cities, 'value')));
      } catch (err) {
        showNotification(err.message, 'error');
      }
    },
    300
  );

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
        <AsyncSelect
          cacheOptions
          loadOptions={loadCities}
          className="react-select"
          classNamePrefix="react-select"
          value={selectedCity}
          onChange={selectCity}
          placeholder="Search..."
          noOptionsMessage={({ inputValue }) => inputValue ? `No match found for ${inputValue}` : 'Start typing to search'}
        />
      </div>
    </section>
  );
};

const EnhancedPageHeader = compose<Props & EnhancedProps, Props>(withRouter)(PageHeader);

export default EnhancedPageHeader;
