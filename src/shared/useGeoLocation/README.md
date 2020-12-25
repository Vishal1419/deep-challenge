# useGeoLocation

## parameters

\* indicates required fields

| Parameter | Default Value | Type | Description |
|---------|---------------|-----------------|-------------|
| localStorageKey | is-location-granted | string | Key to use to store current location in local storage when permission API is not supported in browser |

<br />
<br />

---

<br />

## return

| Parameter | Type | Description |
|---------|---------------|-----------------|-------------|
| coords | { longitude: number, latitude: number } | user's current position's longitude and latitude |
| loading | boolean | Will be true when location is being fetched |
| error | { message: string } | Will have error message if location returns an error |
