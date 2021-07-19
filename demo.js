'use strict';

var helpers = require('./index.js');
var getTaf = require('@ryanburnette/get-taf');
var inspect = require('eyes').inspector({ maxLength: 99999 });

(async function () {
  // for the demo I'll use KSRQ and I already know that it's in America/New_York tz
  var taf = await getTaf('krdu');
  inspect(taf);
  var timeZone = 'America/New_York';

  var demos = {
    localDateTzd: function () {
      console.log(
        'taf.issue_time',
        helpers.localDateTzd({ date: new Date(taf.issue_time), timeZone })
      );
      console.log(
        'taf.valid_time_from',
        helpers.localDateTzd({ date: new Date(taf.valid_time_from), timeZone })
      );
      console.log(
        'taf.valid_time_to',
        helpers.localDateTzd({ date: new Date(taf.valid_time_to), timeZone })
      );
    },
    tzdFormatTime: function () {
      console.log(
        'taf.issue_time',
        helpers.tzdFormatTime(
          helpers.localDateTzd({
            date: new Date(taf.issue_time),
            timeZone
          })
        )
      );
      console.log(
        'taf.valid_time_from',
        helpers.tzdFormatTime(
          helpers.localDateTzd({
            date: new Date(taf.valid_time_from),
            timeZone
          })
        )
      );
      console.log(
        'taf.valid_time_to',
        helpers.tzdFormatTime(
          helpers.localDateTzd({
            date: new Date(taf.valid_time_to),
            timeZone
          })
        )
      );
    },
    changeIndicator: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.changeIndicator({ forecast }))
      );
    },
    wind: function () {
      taf.forecast.forEach((forecast) =>
        console.log(helpers.wind({ forecast }))
      );
    },
    flightCategory: function () {
      taf.forecast.forEach((forecast) => {
        console.log(helpers.flightCategory({ forecast }));
      });
    },
    futureOnly: function () {
      helpers.futureOnly({ taf }).forEach((fc) =>
        console.log(
          helpers.tzdFormatTime(
            helpers.localDateTzd({
              date: new Date(fc.fcst_time_from),
              timeZone
            })
          ) + 'L',
          helpers.tzdFormatTime(
            helpers.localDateTzd({
              date: new Date(fc.fcst_time_to),
              timeZone
            })
          ) + 'L'
        )
      );
    },
    skyConditions: function () {
      taf.forecast.forEach((forecast) => {
        console.log(helpers.skyConditions({ forecast }));
      });
    },
    cloudBaseFormat: function () {
      taf.forecast.forEach((forecast) => {
        console.log(helpers.cloudBaseFormat({ forecast }));
      });
    },
    vis: function () {
      taf.forecast.forEach((forecast) => {
        console.log(helpers.vis({ forecast }));
      });
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
