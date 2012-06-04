dojo.provide('mulberry.Device');

dojo.require('mulberry.Utilities');
dojo.require('mulberry.app.Config');

mulberry._loadDeviceConfig = function() {
  var browserDevices = {
    'ios' : {
      re : /(iPhone|iPod|iPad)/,
      version: function(ua) {
        var vnum = parseFloat(ua.match(/([\d_]+) like Mac OS X/)[1].replace('_', '.'));
        if (!vnum) { return 1; }    // I am hoping this is right?
        return vnum;
      }
    },
    'android' : {
      re : /(Android)/,
      version: function(ua) {
        return parseFloat(ua.match(/Android ([\d\.]+)/)[1]);
      }
    }
  }, ua;


  function getDeviceType() {
    var body = dojo.body(),
        minDim = Math.min(body.offsetWidth, body.offsetHeight);

    return minDim > 640 ? 'tablet' : 'phone';
  }

  mulberry.Device = mulberry.app.Config.get('device') || {
    type : getDeviceType(),
    os : 'browser',
    standalone: !!navigator.standalone
  };

  if (mulberry.Device.os === 'browser') {
    ua = window.navigator.userAgent;

    dojo.forIn(browserDevices, function(k, v) {
      if (ua.search(v.re) > -1) { mulberry.Device.browserOS = k; }
    });

    if (mulberry.Device.browserOS) {
      mulberry.Device.browserVersion = browserDevices[mulberry.Device.browserOS].version(ua);
    }
  }

  mulberry.Device.supportedBrowser = function() {
    /*
     * Currently checking:
     * 1. That we're in a mobile web build (mulberry.Device.os is "browser").
     * 2. Support for webkit prefixes, which rules out non-webkit browsers.
     * 3. Support for touch events.
     * 4. Support for Web SQL.
     * 5. If Android, support for >= 2.2 (we can't test for improper
     *    implementation of background-size: contain/cover in 2.1)
     * */

    var div = document.createElement("div"),
        device = mulberry.Device,
        supportsMulberry,
        supportsWebSql,
        supportsWebkitPrefixes,
        isOldAndroid;

    if (this.os != "browser") {
      return true;
    }

    if (window.location.hostname === "localhost") {
      return true;
    }

    supportsWebkitPrefixes = typeof div.style.webkitTransform !== "undefined";
    supportsTouch = 'ontouchstart' in document.documentElement;
    supportsWebSql = 'openDatabase' in window;
    isOldAndroid = device.os === 'browser' && device.browserOS === 'android' && device.browserVersion < 2.2;
    alert('isOldAndroid=' + isOldAndroid);

    supportsMulberry = supportsWebkitPrefixes &&
                       supportsTouch &&
                       supportsWebSql &&
                       !isOldAndroid;

    return supportsMulberry;
  };
};

mulberry._loadDeviceConfig();
