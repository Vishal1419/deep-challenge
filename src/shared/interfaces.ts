export interface UserData {
  cityName: string;
  isFavorite: boolean;
  notes: string;
};

export interface City {
  name: string;
  title: string;
};

export interface Weather {
  name: string;
  title: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  imageSource: string;
};
