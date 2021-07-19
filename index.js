'use strict';

var _formatToTimeZone = require('date-fns-timezone').formatToTimeZone;

var helpers = {};

function localTime({ date, timeZone, format }) {
  if (!date) {
    date = new Date();
  }
  if (!timeZone) {
    timeZone = 'America/New_York';
  }
  if (!format) {
    format = 'HH:mm';
  }
  return _formatToTimeZone(date, format, { timeZone });
}

function changeIndicator({ forecast, i }) {
  if (i == 0) {
    return 'VALID';
  }

  if (!forecast.change_indicator) {
    return 'FM';
  }

  if (forecast.change_indicator == 'PROB') {
    return 'PROB' + forecast.probability;
  }

  return forecast.change_indicator;
}

function windDir({ forecast }) {
  var wd = forecast.wind_dir_degrees;
  if (wd.length === 3) {
    return wd;
  } else if (wd.length === 2) {
    return '0' + windDir;
  } else if (wd == '0') {
    return '360';
  }
}

function windSpeed({ forecast }) {
  var ws = forecast.wind_speed_kt;
  if (ws.length === 1) {
    return '0' + ws;
  } else {
    return ws;
  }
}

function wind({ forecast }) {
  if (!forecast.wind_dir_degrees || !forecast.wind_speed_kt) {
    return '';
  } else if (!forecast.wind_gust_kt) {
    return windDir({ forecast }) + windSpeed({ forecast }) + 'KT';
  } else {
    return (
      windDir({ forecast }) +
      windSpeed({ forecast }) +
      'G' +
      forecast.wind_gust_kt +
      'KT'
    );
  }
}

function skyCategory({ forecast }) {
  var skyConditions = forecast.sky_condition;
  if (!Array.isArray(skyConditions)) {
    skyConditions = [skyConditions];
  }
  return skyConditions.reduce(function (skyCategory, skyCondition) {
    if (skyCondition) {
      if (['OVC', 'BKN', 'OVX'].includes(skyCondition.sky_cover)) {
        var bases = parseFloat(skyCondition.cloud_base_ft_agl);
        if (bases <= 3000 && skyCategory < 2) {
          skyCategory = 2;
        }
        if (bases < 1000 && skyCategory < 3) {
          skyCategory = 3;
        }
        if (bases < 500 && skyCategory < 4) {
          skyCategory = 4;
        }
      }
    }
    return skyCategory;
  }, 1);
}

function vis({ forecast }) {
  if (!forecast.visibility_statute_mi) {
    return;
  }
  var _vis = parseFloat(forecast.visibility_statute_mi);
  if (_vis > 6) {
    return 'P6SM';
  }
  if (Number.isInteger(_vis)) {
    return _vis + 'SM';
  }
  if (!Number.isInteger(_vis)) {
    var gcd = function (a, b) {
      if (b < 0.0001) return a; // Since there is a limited precision we need to limit the value.
      return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
    };
    var fraction = _vis;
    var c = 0;
    while (fraction > 1) {
      fraction--;
      c++;
    }
    var len = fraction.toString().length - 2;
    var denominator = Math.pow(10, len);
    var numerator = fraction * denominator;
    var di_visor = gcd(numerator, denominator); // Should be 5
    numerator /= di_visor; // Should be 687
    denominator /= di_visor; // Should be 2000
    if (c == 0) {
      return Math.floor(numerator) + '/' + Math.floor(denominator) + 'SM';
    } else {
      return (
        c + ' ' + Math.floor(numerator) + '/' + Math.floor(denominator) + 'SM'
      );
    }
  }
}

function visCategory({ forecast }) {
  if (!forecast.visibility_statute_mi) {
    return 1; //vfr
  }
  var v = vis({ forecast });
  if (v < 1) {
    return 4; //lifr
  } else if (v < 3 && v > 1) {
    return 3; //ifr
  } else if (v <= 5 && v >= 3) {
    return 2; //mvfr
  }
  return 1; //vfr
}

function flightCategory({ forecast }) {
  var highestCategory = Math.max(visCategory(forecast), skyCategory(forecast));
  var flightCategories = ['', 'VFR', 'MVFR', 'IFR', 'LIFR'];
  return flightCategories[highestCategory];
}

function isPast({ forecast }) {
  return new Date().getTime() >= forecast.fcst_time_to.getTime();
}

function futureOnly({ forecast }) {
  if (!Array.isArray(forecast)) {
    forecast = [forecast];
  }
  return forecast.filter(function (f) {
    return !isPast(f);
  });
}

function skyConditions({ forecast }) {
  if (!forecast.sky_condition) {
    return;
  }
  var output = '';
  if (!Array.isArray(forecast.sky_condition)) {
    forecast.sky_condition = [forecast.sky_condition];
  }
  forecast.sky_condition.forEach(function (el) {
    var elSkyCover = el.sky_cover;
    var elCloudBases = el.cloud_base_ft_agl;
    var elCloudType = el.cloud_type;
    var elVerticalVis;
    if (elCloudType === undefined) {
      elCloudType = '';
    }
    if (el.vert_vis_ft == undefined) {
      elVerticalVis = '';
    } else {
      elVerticalVis = 'VV' + cloudBaseFormat(el.vert_vis_ft);
    }
    if (elSkyCover == 'OVX') {
      elSkyCover = '';
    }
    output =
      output +
      ' ' +
      elSkyCover +
      cloudBaseFormat(elCloudBases) +
      elCloudType +
      elVerticalVis;
  });
  return output;
}

function cloudBaseFormat({ elCloudBases }) {
  if (elCloudBases === undefined) {
    return '';
  } else if (elCloudBases.length === 3) {
    return '00' + elCloudBases.substring(0, 1);
  } else if (elCloudBases.length === 4) {
    return '0' + elCloudBases.substring(0, 2);
  } else if (elCloudBases.length === 5) {
    return elCloudBases.substring(0, 3);
  }
}

module.exports = {
  localTime,
  changeIndicator,
  windDir,
  windSpeed,
  wind,
  skyCategory,
  vis,
  visCategory,
  flightCategory,
  isPast,
  futureOnly,
  skyConditions,
  cloudBaseFormat
};
