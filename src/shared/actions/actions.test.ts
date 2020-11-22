import { UserData } from '../interfaces';
import {
  getFavorites, getUserData, saveUserData,
  getRemovedCities, removeCity, restoreCity,
} from './index';

describe('getFavorites', () => {
  const KEY = 'user-data';

  it('returns only favorite items from user-data', () => {
    const VALUES = [
      {
        cityName: 'test1',
        isFavorite: true,
        notes: 'Note for test1',
      },
      {
        cityName: 'test2',
        isFavorite: false,
        notes: 'Note for test2',
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const favorites = getFavorites();
    expect(favorites.every(item => item.isFavorite)).toBeTruthy();
  });
  
  it('returns empty array when there are no favorites in user-data', () => {
    const VALUES = [
      {
        cityName: 'test1',
        isFavorite: false,
        notes: 'Note for test1',
      },
      {
        cityName: 'test2',
        isFavorite: false,
        notes: 'Note for test2',
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const favorites = getFavorites();
    expect(favorites).toHaveLength(0);
  });
});

describe('getUserData', () => {
  const KEY: string = 'user-data';
  let VALUES: UserData[];

  beforeEach(() => {
    VALUES = [
      {
        cityName: 'test1',
        isFavorite: true,
        notes: 'Note for test1',
      },
      {
        cityName: 'test2',
        isFavorite: false,
        notes: 'Note for test2',
      },
    ];
    localStorage.setItem(KEY, JSON.stringify(VALUES));
  });

  it('returns data of passed in city when present', () => {
    const test1Data = getUserData(VALUES[0].cityName);
    expect(test1Data).toMatchObject({
      cityName: 'test1',
      isFavorite: true,
      notes: 'Note for test1',
    });
  });
  
  it('returns undefined when data of city is not present', () => {
    const test3Data = getUserData('test3');
    expect(test3Data).toBeUndefined();
  });
});

describe('saveUserData', () => {
  const KEY: string = 'user-data';
  let VALUES: UserData[];
  let ITEM: UserData;

  beforeEach(() => {
    VALUES = [
      {
        cityName: 'test1',
        isFavorite: true,
        notes: 'Note for test1',
      },
      {
        cityName: 'test2',
        isFavorite: false,
        notes: 'Note for test2',
      },
    ];
    ITEM = {
      cityName: 'test3',
      isFavorite: true,
      notes: 'Note for test3',
    };
    
    localStorage.setItem(KEY, JSON.stringify(VALUES));
  })

  it('adds new array with passed in data when user data does not exist', () => {
    localStorage.clear();
    expect(localStorage.getItem(KEY)).toBeNull();
    saveUserData(ITEM);
    expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toHaveLength(1);
  });
  
  it('adds new item to user data when it does does not contain cityName', () => {
    saveUserData(ITEM);
    expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toHaveLength(VALUES.length + 1);
  });
  
  it('modifies the user data if cityName exists and isFavorite is false and notes is present', () => {
    ITEM = {
      cityName: 'test1',
      isFavorite: false,
      notes: 'Note for test3',
    };
    saveUserData(ITEM);
    const userData: UserData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    expect(
      userData.find(item => item.cityName === ITEM.cityName)
    ).toMatchObject(ITEM);
    expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toHaveLength(VALUES.length);
  });

  it('modifies the user data if cityName exists and isFavorite is true and notes is empty', () => {
    ITEM = {
      cityName: 'test1',
      isFavorite: true,
      notes: '',
    };
    saveUserData(ITEM);
    const userData: UserData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    expect(
      userData.find(item => item.cityName === ITEM.cityName)
    ).toMatchObject(ITEM);
    expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toHaveLength(VALUES.length);
  });

  it('removes the user data when cityName exists and isFavorite is false and notes is empty', () => {
    ITEM = {
      cityName: 'test1',
      isFavorite: false,
      notes: '',
    };
    saveUserData(ITEM);
    const userData: UserData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
    expect(userData.find(item => item.cityName === ITEM.cityName)).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(KEY) || '[]')).toHaveLength(VALUES.length - 1);
  });

  it('should not add stale data to local storage and when data changes stale data should be removed', () => {
    for (let i = 0; i < 20; i++) {
      ITEM = {
        cityName: 'test1',
        isFavorite: Math.random() <= 0.5,
        notes: Math.random() <= 0.5 ? 'Note for test3' : '',
      };
      saveUserData(ITEM);
      const userData: UserData[] = JSON.parse(localStorage.getItem(KEY) || '[]')
      expect(userData.find(item => !item.isFavorite && !item.notes)).toBeUndefined();
    }
  });
});

describe('getRemovedCities', () => {
  const KEY = 'removed-cities';
  let VALUES: string[];

  beforeEach(() => {
    VALUES = ['test1', 'test2'];
  })

  it('returns empty array when removed-cities does not exist in local storage', () => {
    const removedCities = getRemovedCities();
    expect(removedCities).toHaveLength(0);
  });

  it('returns removed-cities from local storage', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = getRemovedCities();
    expect(removedCities).toEqual(VALUES);
  });
});

describe('removeCity', () => {
  const KEY = 'removed-cities';
  let VALUES: string[];
  let ITEM: string;

  beforeEach(() => {
    VALUES = ['test1', 'test2'];
    ITEM = 'test3';
  });

  it('returns removed-cities after completing the operation', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = removeCity(ITEM);
    expect(removedCities).toEqual([...VALUES, ITEM]);
  });

  it('creates new array and adds city to that array and assigns to removed-cities and adds to localstorage when removed-cities does not exist in local storage', () => {
    const removedCities = removeCity(ITEM);
    expect(removedCities[0]).toEqual(ITEM);
  });

  it('does not add duplicates', () => {
    ITEM = VALUES[0];
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = removeCity(ITEM);
    expect(removedCities).toHaveLength(VALUES.length);
  });

  it('adds item when item is not present', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = removeCity(ITEM);
    expect(removedCities.includes(ITEM)).toBeTruthy();
  });
});

describe('restoreCity', () => {
  const KEY = 'removed-cities';
  let VALUES: string[];
  let ITEM: string;

  beforeEach(() => {
    VALUES = ['test1', 'test2'];
    ITEM = VALUES[0];
  });

  it('returns removed-cities after completing the operation', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = restoreCity(ITEM);
    expect(removedCities).toEqual(VALUES.filter(value => value !== ITEM));
  });

  it('returns an empty array when removed-cities is not defined', () => {
    const removedCities = restoreCity(ITEM);
    expect(removedCities).toHaveLength(0);
  });

  it('returns existing removed cities when city is not present in removed cities', () => {
    ITEM = 'test3';
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = restoreCity(ITEM);
    expect(removedCities).toEqual(VALUES);
  });

  it('returns all cities except the restored city when city is present in removed cities', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const removedCities = restoreCity(ITEM);
    expect(removedCities).toEqual(VALUES.filter(value => value !== ITEM));
  });
});
