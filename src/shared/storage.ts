import { QueryClient } from 'react-query';

// Persist to wherever using the super-secret object
const writeToStorage = async (queryKey: string, data: any) => {
  let storageData = localStorage.getItem('queries');

  storageData = {
    ...JSON.parse(storageData ?? '{}'),
    [queryKey]: data,
  };
  localStorage.setItem('queries', JSON.stringify(storageData));
};

// Hydrate from localStorage

const readFromStorage = (queryClient: QueryClient) => {
  const storageData = localStorage.getItem('queries');

  if (storageData !== null) {
    const queriesWithData = JSON.parse(storageData);

    for (const queryKey in queriesWithData) {
      const data = queriesWithData[queryKey];
      const queryKeyParsed = JSON.parse(queryKey);
      queryClient.setQueryData(queryKeyParsed, data);
    }
  }
};

export {readFromStorage, writeToStorage};
