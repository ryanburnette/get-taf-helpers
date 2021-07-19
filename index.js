'use strict';

var TZ = require('xtz');

function localDateTzd({ date, timeZone }) {
  return TZ.toTimeZone(date, timeZone);
}

function tzdFormatTime(tzd) {
  var hh = (tzd.hour < 10 ? '0' : '') + tzd.hour;
  var mm = (tzd.minute < 10 ? '0' : '') + tzd.minute;
  return hh + ':' + mm;
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

function _windDir({ forecast }) {
  var wd = forecast.wind_dir_degrees;
  if (wd.length === 3) {
    return wd;
  } else if (wd.length === 2) {
    return '0' + wd;
  } else if (wd == '0') {
    return '360';
  }
}

function _windSpeed({ forecast }) {
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
    return _windDir({ forecast }) + _windSpeed({ forecast }) + 'KT';
  } else {
    return (
      _windDir({ forecast }) +
      _windSpeed({ forecast }) +
      'G' +
      forecast.wind_gust_kt +
      'KT'
    );
  }
}

function _skyCategory({ forecast }) {
  var skyConditions = forecast.sky_condition;
  if (!Array.isArray(skyConditions)) {
    skyConditions = [skyConditions];
  }
  return skyConditions.reduce(function (_skyCategory, skyCondition) {
    if (skyCondition) {
      if (['OVC', 'BKN', 'OVX'].includes(skyCondition.sky_cover)) {
        var bases = parseFloat(skyCondition.cloud_base_ft_agl);
        if (bases <= 3000 && _skyCategory < 2) {
          _skyCategory = 2;
        }
        if (bases < 1000 && _skyCategory < 3) {
          _skyCategory = 3;
        }
        if (bases < 500 && _skyCategory < 4) {
          _skyCategory = 4;
        }
      }
    }
    return _skyCategory;
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

function _visCategory({ forecast }) {
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
  var highestCategory = Math.max(
    _visCategory({ forecast }),
    _skyCategory({ forecast })
  );
  var flightCategories = ['', 'VFR', 'MVFR', 'IFR', 'LIFR'];
  return flightCategories[highestCategory];
}

function _isPast({ forecast }) {
  return new Date().getTime() >= new Date(forecast.fcst_time_to).getTime();
}

function futureOnly({ taf }) {
  return taf.forecast.filter(function (forecast) {
    return !_isPast({ forecast });
  });
}

function _cloudBaseFormat(elCloudBases) {
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
      elVerticalVis = 'VV' + _cloudBaseFormat(el.vert_vis_ft);
    }
    if (elSkyCover == 'OVX') {
      elSkyCover = '';
    }
    output =
      output +
      ' ' +
      elSkyCover +
      _cloudBaseFormat(elCloudBases) +
      elCloudType +
      elVerticalVis;
  });
  return output;
}

module.exports = {
  localDateTzd,
  tzdFormatTime,
  changeIndicator,
  wind,
  flightCategory,
  futureOnly,
  skyConditions,
  vis
};
