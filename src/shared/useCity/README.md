# useCity

## parameters

\* indicates required fields

| Parameter | Default Value | Type | Description |
|---------|---------------|-----------------|-------------|
| rows* | - | number | Number of cities required |
| query | - |  string | City names will be filtered by this parameter |
| sort | - |  population | City names will be sorted by this parameter |
| exclude | - |  string[] | These cities will not be present in the returned data |

<br />
<br />

---

<br />

## return

| Parameter | Type | Description |
|---------|---------------|-----------------|-------------|
| cities | City[] | array of city object <br /> City object will contain: name and title |
| isLoading | boolean | Will be true when data is being fetched |
| isError | boolean | Will be true if response has error |
| error | Error | Will have error message |

<br />
<br />

---

<br />

## Notes

 - data will be considered as fresh till next 2 hours of fetching data
 - data will be stale till 1 day after it is fetched
 - on error, it will not retry to fetch the data
 - it will not fetch again when window is focused
 - data will be updated in localstorage everytime it is fetched

