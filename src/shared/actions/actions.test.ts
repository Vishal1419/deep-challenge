import { UserData } from '../interfaces';
import {
  getFavorites, getUserData, saveUserData,
  getRemovedCities, removeCity,
  restoreCity, getRestoredCities,
  getExcludedCities, updateExcludedCities,
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

describe('getRestoredCities', () => {
  const KEY = 'restored-cities';
  let VALUES: string[];

  beforeEach(() => {
    VALUES = ['test1', 'test2'];
  })

  it('returns empty array when restored-cities does not exist in local storage', () => {
    const restoredCities = getRestoredCities();
    expect(restoredCities).toHaveLength(0);
  });

  it('returns restored-cities from local storage', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const restoredCities = getRestoredCities();
    expect(restoredCities).toEqual(VALUES);
  });
});

describe('removeCity', () => {
  const KEY_REMOVED = 'removed-cities';
  const KEY_RESTORED = 'restored-cities';
  let VALUES_REMOVED: string[];
  let VALUES_RESTORED: string[];
  let ITEM: string;

  beforeEach(() => {
    VALUES_REMOVED = ['test1', 'test2'];
    VALUES_RESTORED = ['test3', 'test4'];
    ITEM = 'test5';
  });

  it('removes city from restored-cities before adding to removed-cities', () => {
    ITEM = 'test3';
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    removeCity(ITEM);
    const restoredCities = getRestoredCities();
    expect(restoredCities.includes(ITEM)).toBeFalsy();
  });

  it('does not touch restored-cities when city is not present in restored-cities before adding to removed-cities', () => {
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    removeCity(ITEM);
    const restoredCities = getRestoredCities();
    expect(restoredCities).toEqual(VALUES_RESTORED);
  });

  it('adds city to removed-cities', () => {
    ITEM = 'test3';
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    removeCity(ITEM);
    const removedCities = getRemovedCities();
    expect(removedCities.includes(ITEM)).toBeTruthy();
  });

  it('does not add duplicate city to removed-cities', () => {
    ITEM = 'test2';
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    removeCity(ITEM);
    const removedCities = getRemovedCities();
    expect(removedCities).toEqual(VALUES_REMOVED);
  });

  it('creates a new array, adds city to it and saves that array to removed-cities when removed-cities is empty', () => {
    ITEM = 'test1';
    removeCity(ITEM);
    const removedCities = getRemovedCities();
    expect(removedCities).toEqual([ITEM]);
  });
});

describe('restoreCity', () => {
  const KEY_REMOVED = 'removed-cities';
  const KEY_RESTORED = 'restored-cities';
  let VALUES_REMOVED: string[];
  let VALUES_RESTORED: string[];
  let ITEM: string;

  beforeEach(() => {
    VALUES_REMOVED = ['test1', 'test2'];
    VALUES_RESTORED = ['test3', 'test4'];
    ITEM = 'test5';
  });

  it('removes city from removed-cities before adding to restored-cities', () => {
    ITEM = 'test1';
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    restoreCity(ITEM);
    const removedCities = getRemovedCities();
    expect(removedCities.includes(ITEM)).toBeFalsy();
  });

  it('does not touch removed-cities when city is not present in removed-cities before adding to restored-cities', () => {
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    restoreCity(ITEM);
    const removedCities = getRemovedCities();
    expect(removedCities).toEqual(VALUES_REMOVED);
  });

  it('adds city to restored-cities', () => {
    ITEM = 'test1';
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    restoreCity(ITEM);
    const restoredCities = getRestoredCities();
    expect(restoredCities.includes(ITEM)).toBeTruthy();
  });

  it('does not add duplicate city to restored-cities', () => {
    ITEM = 'test3';
    localStorage.setItem(KEY_RESTORED, JSON.stringify(VALUES_RESTORED));
    restoreCity(ITEM);
    const restoredCities = getRestoredCities();
    expect(restoredCities).toEqual(VALUES_RESTORED);
  });

  it('creates a new array, adds city to it and saves that array to restored-cities when restored-cities is empty', () => {
    restoreCity(ITEM);
    const restoredCities = getRestoredCities();
    expect(restoredCities).toEqual([ITEM]);
  });
});

describe('getExlcudedCities', () => {
  const KEY = 'excluded-cities';
  let VALUES: string[];

  beforeEach(() => {
    VALUES = ['test1', 'test2'];
  });

  it('returns empty array when excluded-cities does not exist in local storage', () => {
    const excludedCities = getExcludedCities();
    expect(excludedCities).toHaveLength(0);
  });

  it('returns excluded-cities from local storage', () => {
    localStorage.setItem(KEY, JSON.stringify(VALUES));
    const excludedCities = getExcludedCities();
    expect(excludedCities).toEqual(VALUES);
  });
});

describe('updateExcludedCities', () => {
  const KEY_REMOVED = 'removed-cities';
  const KEY_EXCLUDED = 'excluded-cities';
  let VALUES_REMOVED: string[];
  let VALUES_EXCLUDED: string[];

  beforeEach(() => {
    VALUES_REMOVED = ['test1', 'test2', 'test3', 'test4'];
    VALUES_EXCLUDED = ['test1', 'test2'];
  });

  it('should blindly dump all the removed-cities to excluded-cities', () => {
    localStorage.setItem(KEY_REMOVED, JSON.stringify(VALUES_REMOVED));
    localStorage.setItem(KEY_EXCLUDED, JSON.stringify(VALUES_EXCLUDED));
    updateExcludedCities();
    const excludedCities = getExcludedCities();
    expect(excludedCities).toEqual(VALUES_REMOVED);
  });
});
