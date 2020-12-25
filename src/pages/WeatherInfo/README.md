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

**Add Notes Click**
 - Shows textarea to enter notes


**Cancel Click**
 - Put textarea in readonly mode


**Save Click**
- saves notes to user-data in local-storage
  
**Edit Click**
- Puts textarea in editing mode
  
**Edit Click**
- shows delete confirmation dialog
- on click of confirm, it will remove notes from user-data in local-storage

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

Restore button will be displayed if user has removed city on the Home page

![Restore](README-assets/restore.png)

<br />
<br />
<br />

Favorite/Unfavorite will be displayed depending on its current favorite status if city is not removed.

![Mark as favorite](README-assets/not-favorite.png)
![Unmark as favorite](README-assets/favorite.png)

<br />
<br />
<br />

When there are no notes, no notes message along with add notes button is displayed.

![Add Notes](README-assets/add-notes.png)

<br />
<br />
<br />


On click of Add notes, text editor is displayed

![Text Editor](README-assets/notes-editing.png)

<br />
<br />
<br />

Shows saved notes when saved.

![Saved Notes](README-assets/notes-added.png)

<br />
<br />
<br />

When user tries to leave the page with unsaved notes, a dialog will be displayed.

![Notes unsaved](README-assets/notes-unsaved.png)

<br />
<br />
<br />

On click of delete button, we can see delete notes dialog

![Delete Notes](README-assets/delete-notes.png)
