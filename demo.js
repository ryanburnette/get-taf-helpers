'use strict';

var helpers = require('./index.js');
var getTaf = require('@ryanburnette/get-taf');
var inspect = require('eyes').inspector({ maxLength: 99999 });

(async function () {
  // for the demo I'll use KSRQ and I already know that it's in America/New_York tz
  var taf = await getTaf('ksrq');
  inspect(taf);
  var timeZone = 'America/New_York';

  var demos = {
    localTime: function () {
      console.log(
        'taf.issue_date',
        helpers.localTime({ date: taf.issue_date, timeZone })
      );
      console.log(
        'taf.valid_time_from',
        helpers.localTime({ date: taf.valid_time_from, timeZone })
      );
      console.log(
        'taf.valid_time_to',
        helpers.localTime({ date: taf.valid_time_to, timeZone })
      );
    },
    changeIndicator: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.changeIndicator({ forecast }))
      );
    },
    windDir: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.windDir({ forecast }))
      );
    },
    windSpeed: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.windSpeed({ forecast }))
      );
    },
    wind: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.wind({ forecast }))
      );
    },
    skyCategory: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.skyCategory({ forecast }))
      );
    },
    vis: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.vis({ forecast }))
      );
    },
    visCategory: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.visCategory({ forecast }))
      );
    }
  };

  Object.keys(helpers).forEach((k) => {
    if (demos[k]) {
      console.log('demo', k);
      demos[k]();
    } else {
      console.log('todo', k);
    }
  });
})();
