# [get-taf-helpers](https://github.com/ryanburnette/get-taf-helpers)

Opinionated template helpers for use with
[ryanburnette/get-taf](https://github.com/ryanburnette/get-taf).

## Usage

Not published to NPM. Install from Github. Use a commit hash (not demonstrated).

```bash
npm install ryanburnette/get-taf-helpers
```

See `demo.js` for usage.

```js
var helpers = require('@ryanburnette/get-taf-helpers');
var {
  localDateTzd,
  tzdFormatTime,
  changeIndicator,
  wind,
  flightCategory,
  futureOnly,
  skyConditions
} = helpers;
```
