import { UserData } from '../interfaces';

export const getFavorites = () => {
  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  const favorites = userData.filter(data => data.isFavorite);
  return favorites;
};

export const getUserData = (cityName: string) => {
  const userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  return userData.find(data => data.cityName === cityName);
};

export const saveUserData = (data: UserData) => {
  let userData: UserData[] = JSON.parse(localStorage.getItem('user-data') || '[]');
  if (userData.find(item => item.cityName === data.cityName)) {
    if (!data.isFavorite && !data.notes) {
      userData = userData.filter(item => item.cityName !== data.cityName);
    } else {
      userData = userData.map(item => {
        if (item.cityName === data.cityName) return data;
        return item;
      });
    }
  } else if (data.isFavorite || data.notes) {
    userData.push(data);
  }
  localStorage.setItem('user-data', JSON.stringify(userData));
};

export const getRemovedCities = () => {
  const removedCities: string[] = JSON.parse(localStorage.getItem('removed-cities') || '[]');
  return removedCities;
};

export const removeCity = (name: string) => {
  const removedCities = getRemovedCities();
  if (!removedCities.includes(name)) removedCities.push(name);
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  return removedCities;
};

export const restoreCity = (name: string) => {
  let removedCities = getRemovedCities();
  removedCities = removedCities.filter(city => city !== name);
  localStorage.setItem('removed-cities', JSON.stringify(removedCities));
  return removedCities;
};

export const getExcludedCities = () => {
  const excludedCities = JSON.parse(localStorage.getItem('excluded-cities') || '[]');
  return excludedCities;
};

export const updateExcludedCities = () => {
  const removedCities = getRemovedCities();
  localStorage.setItem('excluded-cities', JSON.stringify(removedCities));
};
