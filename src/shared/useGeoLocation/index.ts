import { useState, useEffect } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
};

const useGeoLocation = (localStorageKey = 'is-location-granted') => {
  const [shouldRequestLocation, setShouldRequestLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationPositionError>();
  const [coords, setCoords] = useState<Coordinates>();

  const onSuccess = (location: GeolocationPosition) => {
    setLoading(false);
    setCoords({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    if (!('permissions' in navigator)) {
      localStorage.setItem(localStorageKey, JSON.stringify(true));
    }
  }

  const onError = (error: GeolocationPositionError) => {
    setLoading(false);
    setError(error);
  }

  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state !== 'granted') {
          setShouldRequestLocation(true);
        }
      });
    } else {
      const isLocationGranted = JSON.parse(localStorage.getItem(localStorageKey) || 'false');
      if (!isLocationGranted) {
        setShouldRequestLocation(true);
      }
    }
  }, []);

  useEffect(() => {
    if(!('geolocation' in navigator)) {
      const geoError = new GeolocationPositionError();
      setError({
        ...geoError,
        message: 'Geolocation not supported'
      });
    } else if (shouldRequestLocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 18000000 },
      );
    }
  }, [shouldRequestLocation]);

  return { loading, error, coords };
};

export default useGeoLocation;
