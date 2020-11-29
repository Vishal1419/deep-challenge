# useWeather

## parameters

\* indicates required fields

| Parameter | Default Value | Type | Description |
|---------|---------------|-----------------|-------------|
| cityNames* | [] | string[] | City names to fetch the data for |

<br />
<br />

---

<br />

## return

| Parameter | Type | Description |
|---------|---------------|-----------------|-------------|
| weatherCollection | Weather[] | array of weather object <br /> Weather object will contain: name, title, temperature, precipitation, humidity, windSpeed and imageSource |
| isLoading | boolean | Will be true when data is being fetched |
| isError | boolean | Will be true if response has error |
| error | Error | Will have error message |

<br />
<br />

---

<br />

## Notes

 - data will be considered as fresh till next 10 minutes of fetching data
 - data will be stale till 1 day after it is fetched
 - on error, it will not retry to fetch the data
 - data will be updated in localstorage everytime it is fetched

