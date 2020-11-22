export interface City {
  name: string;
  title: string;
};

export interface Weather {
  title: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  imageSource: string;
};

export interface CityWeather extends City, Weather {

}

export interface UserData {
  cityName: string;
  isFavorite: boolean;
  notes: string;
};
