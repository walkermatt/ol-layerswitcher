# Changelog

## 3.8.3

- Add style field to package.json

Should allow tools like npm-css, rework-npm, and npm-less to import the
CSS by package name instead of specifying the full path.

```css
@import "ol-layerswitcher";
```

## 3.8.2

- Include `src/ol-layerswitcher.css` in package to avoid breaking change

## 3.8.1

- Extended layer options now extend `ol` options directly, improves documentation
  and completion
- All interfaces and types are exported as named exports so they can be used as
  needed in TypeScript projects

## 3.8.0

- Build plain `dist/ol-layerswitcher.js` from `.ts` source as well as
  TypeScript type definition
- Improved docs
- **BREAKING CHANGE**: `ol-layerswitcher.css` has moved from `src` to `dist` in the
  published package and hence unpkg.com etc. The path is now:
  `ol-layerswitcher/dist/ol-layerswitcher.css` when importing via Webpack,
  Parcel etc. or `dist/ol-layerswitcher.css` when loading from unpkg.com.

## 3.8.0-beta.1

- Improve docs
- Format and lint

## 3.8.0-beta.0

- Migrate source to TypeScript
- Build .js from .ts as well as TypeScript type definition

## v3.7.0

- New option: `startActive` - whether panel is open when created. Defaults to
  `false`.
- New option: `collapseTipLabel` - the button tooltip when the panel is open.
- Update layout when `activationMode: 'click'` - When open displays a button to
  hide the panel.
- Improve wrapping of long titles (see [screenshots in
  #358](https://github.com/walkermatt/ol-layerswitcher/pull/358#issuecomment-689677181)).
- Format everything with Prettier and lint with ESLint.
