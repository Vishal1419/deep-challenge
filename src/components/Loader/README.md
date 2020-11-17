# Loader

## Code Example

```jsx
  <Loader loading={some_variable}>
    Some Content
  </Loader>
```

<br />
<br />

---

<br />

## Props

\* indicates required fields

|PropName | Default Value | Type | Description |
|---------|---------------|-----------------|-------------|
| children* | - | ReactNode | It will display whatever is passed in as children in the background. Its display is dependent on renderChildren. |
| loading* | - |  boolean | It will show a loader if loading is true, else it will display the content. |
| size | 50 | number | It sets the height and width of the loader |
| renderChildren | true | boolean | If true, it will show children while loading. Otherwise it will hide children while loading. In any case if loading is false, it will display children |

<br />
<br />

---

<br />

## Images

Loading

![Loading](README-assets/loader.png)
