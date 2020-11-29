# Weather Info

This page is rendered inside Layout component having **back to home** link.

<br />
<br />
<br />

## Functioning

**Initially**
- Gets city name from url
- Fetches weather data for the city

<br />

**Save Click**
- saves notes to user-data in local-storage

<br />

**Restore**
- removes city from removed-cities in local-storage
- saves city name in restored-cities in local-storage

<br />

**Mark/Unmark as favorite**
- saves favorite as true or false to user-data in local-storage


<br />
<br />

---

<br />

## Rendering

<br />
<br />
<br />

Displays city and weather information on the page

![Weather Info](README-assets/weather-info.png)

<br />
<br />
<br />

Displays a text area, where user can add or edit notes

User can save notes by clicking on save button

![Notes](README-assets/notes.png)

<br />
<br />
<br />

User will see an alert if notes is not saved and he is moving away from the page

![Notes unsaved](README-assets/unsaved-notes.png)

<br />
<br />
<br />

Restore button will be displayed if user has removed city on the Home page

![Restore](README-assets/restore.png)

<br />
<br />
<br />

Favorite/Unfavorite will be displayed depending on its current status if city is not removed.

![Mark as favorite](README-assets/mark-as-favorite.png)
![Unmark as favorite](README-assets/remove-from-favorites.png)
