import { useQuery } from 'react-query';

import { City } from '../interfaces';
import { fetcher } from '../utils';
import { BASE_URL } from '../../config';

export type SortType = 'population';

interface Props {
  rows: number;
  query?: string;
  sort?: SortType;
  exclude?: string[];
}

interface CitiesResponse {
  records: {
    fields: {
      city: string;
      accentcity: string;
    }
  }[]
}

const fetchCities = async ({ rows, query, sort, exclude }: Props): Promise<CitiesResponse> => {
  try {
    const params = [`rows=${rows}`];
    if (query) params.push(`q=${query}`);
    if (sort) params.push(`sort=${sort}`);
    if (exclude && exclude.length > 0) params.push(...exclude.map(city => `exclude.city=${city}`))

    const url = `${BASE_URL.CITIES_SERVICE}?dataset=worldcitiespop&facet=city&${params.join('&')}`;
    const cities: CitiesResponse = await fetcher(url);
    return cities;
  } catch (err) {
    throw err;
  }
};

const useCity = ({ rows, query, sort, exclude }: Props) => {
  const { data, isLoading, isError, error } = useQuery(['cities', { rows, query, sort, exclude }], () => fetchCities({ rows, query, sort, exclude }));
  const cities: City[] = data?.records.map(record => ({ name: record.fields.city, title: record.fields.accentcity })) || [];
  return { cities, isLoading, isError, error: error as Error };
};

export default useCity;
