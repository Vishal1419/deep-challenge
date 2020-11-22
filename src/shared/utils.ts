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
