export const fetcher = async (input: RequestInfo, init?: RequestInit | undefined) => {
  const response = await fetch(input, init);
  const result = await response.json();
  if(response.status < 200 || response.status >= 300) {
    throw result.error || result;
  }
  return result;
};

export const compareCityNames = (str1: string, str2: string) => {
  const arr1 = str1.toLocaleLowerCase().replace('new ', 'new#').split(' ');
  const arr2 = str2.toLocaleLowerCase().replace('new ', 'new#').split(' ');

  return arr1.every(item => arr2.includes(item)) || arr2.every(item => arr1.includes(item));
}

export const uniqBy = <T>(arr: Array<T>, predicate: keyof T | ((value: T, index?: number, array?: T[]) => value is T)) => {
  const cb = typeof predicate === 'function' ? predicate : (o: T) => o[predicate];

  return [
    ...arr.reduce((map, item) => {
      const key = cb(item);
      map.has(key) || map.set(key, item);
      return map;
    }, new Map()).values()
  ];
};
