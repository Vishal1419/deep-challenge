# utils

## fetcher

It is just a wrapper around fetch function which throws errors and converts promise to data

<br />
<br />

---

<br />

## compareCityNames

This function takes in two city names and returns true or false by comparing the two cities using the following apporach:

convert both city names to lowercase and split the city name by space (ignore if city name starts with <strong>new<strong>)

Check if every item in both arrays are present and return the result.

### return Type: boolean

### parameters:

\* indicates required fields

| Parameter | Default Value | Type | Description |
|---------|---------------|-----------------|-------------|
| str1* | [] | string | 1st city |
| str2* | [] | string | 2nd city |

<br />
<br />

---

<br />

## uniqBy

This function takes in array of objects and a comparison key or comparison function and returns a new array with unique items

### return Type: new Array with unique items

### parameters:

\* indicates required fields

| Parameter | Type | Description |
|---------|---------------|-----------------|-------------|
| arr* | T[] | Array of objects |
| predicate* | string \| function | key of the object on which comparison will be done <br /> or <br /> pass your own function for comparison |
