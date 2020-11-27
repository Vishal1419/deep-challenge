import useSWR from 'swr';

import { City } from '../interfaces';
import { BASE_URL } from '../../config';

export type SortType = 'population';

interface CitiesResponse {
  data?: {
    records: {
      fields: {
        city: string;
        accentcity: string;
      }
    }[]
    error?: {
      message: string;
    }
  },
  error?: {
    message: string;
  }
};

interface Props {
  start?: number;
  rows: number;
  query?: string;
  sort?: SortType;
  exclude?: string[];
}

const useCity = ({ start = 0, rows, query, sort, exclude }: Props) => {
  const params = [`start=${start}`, `rows=${rows}`];
  if (query) params.push(`q=${query}`);
  if (sort) params.push(`sort=${sort}`);
  if (exclude && exclude.length > 0) params.push(...exclude.map(city => `exclude.city=${city}`))

  const { data, error }: CitiesResponse = useSWR(
    `${BASE_URL.CITIES_SERVICE}?dataset=worldcitiespop&facet=city&${params.join('&')}`,
    { revalidateOnFocus: false,  },
  );

  let cities: City[] = [];
  let _error = error;

  if (data?.error) {
    _error = data?.error;
  }

  if (!_error) {
    cities = data?.records.map(record => ({
      name: record.fields.city,
      title: record.fields.accentcity,
    })) || [];
  }

  return {
    cities,
    loading: !_error && !data,
    error: _error,
  };
};

export default useCity;
