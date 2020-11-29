# actions

## getFavorites
<table>
  <tr>
    <th>parameters</th>
    <td>-</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>UserData[]</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>user-data</code> and removes items that are <strong>not favorite</strong>. Then it returns those <strong>items</strong>.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## getUserData
<table>
  <tr>
    <th>parameters</th>
    <td>cityName: string</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>UserData</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>user-data</code> and finds the item with <code>cityName</code> from those items. If found, returns that <strong>item</strong> otherwise returns <strong>undefined</strong>.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## saveUserData
<table>
  <tr>
    <th>parameters</th>
    <td>data: UserData</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>void</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>user-data</code> and finds the item with <code>data.cityName</code> from those items. If found, <strong>modifies that item</strong> otherwise <strong>adds new item</strong> to the items array. If the item is not favorite and there are no notes, then that item is remoived and Then saves the list back to local-storage.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## getRemovedCities
<table>
  <tr>
    <th>parameters</th>
    <td>-</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>string[]</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>removed-cities</code> and returns it.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## removeCity
<table>
  <tr>
    <th>parameters</th>
    <td>name: string</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>void</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>restored-cities</code> and <strong>removes item from the array</strong>, then save array to local storage.<br />Gets all items from local-storage with key <code>removed-cities</code> and checks for item existance. If <strong>not found</strong>, then <strong>adds it to the array</strong>, save array to local storage.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## getRestoredCities
<table>
  <tr>
    <th>parameters</th>
    <td>-</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>string[]</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>restored-cities</code> and returns it.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## restoreCity
<table>
  <tr>
    <th>parameters</th>
    <td>name: string</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>void</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>removed-cities</code> and <strong>removes item from the array</strong>, then save array to local storage.<br />Gets all items from local-storage with key <code>restored-cities</code> and checks for item existance. If <strong>not found</strong>, then <strong>adds it to the array</strong>, save array to local storage.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## getExcludedCities
<table>
  <tr>
    <th>parameters</th>
    <td>-</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>string[]</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>excluded-cities</code> and returns it.</td>
  </tr>
</table>

<br />
<br />

___

<br />

## updateExcludedCities
<table>
  <tr>
    <th>parameters</th>
    <td>-</td>
  </tr>
  <tr>
    <th>returnType</th>
    <td>string[]</td>
  </tr>
  <tr>
    <th>operation</th>
    <td>Gets all items from local-storage with key <code>removed-cities</code> and dumps it to <code>excluded-cities</code> in local-storage.</td>
  </tr>
</table>

<br />
<br />

___

<br />
