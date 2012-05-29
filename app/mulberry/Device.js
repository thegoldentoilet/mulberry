dojo.provide('mulberry.Device');

dojo.require('mulberry.app.Config');

mulberry._loadDeviceConfig = function() {

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

  mulberry.Device.supportedBrowser = function() {
    /*
     * Currently checking:
     * 1. That we're in a mobile web build (mulberry.Device.os is "browser").
     * 2. Support for webkit prefixes, which rules out non-webkit browsers.
     * 3. Support for touch events.
     * 4. Support for the hashchange event. This rules out pre-Froyo Android.
     * 5. Support for Web SQL.
     * */

    var div = document.createElement("div"),
        supportsMulberry,
        supportsWebSql,
        supportsWebkitPrefixes,
        supportsHashchange,
        supportsFontFace;

    if (this.os != "browser") {
      return true;
    }

    if (window.location.hostname === "localhost") {
      return true;
    }

    supportsWebkitPrefixes = typeof div.style.webkitTransform !== "undefined";
    supportsTouch = 'ontouchstart' in document.documentElement;
    supportsWebSql = 'openDatabase' in window;
    supportsHashchange = 'onhashchange' in window;

    supportsMulberry = supportsWebkitPrefixes &&
                       supportsTouch &&
                       supportsHashchange &&
                       supportsWebSql;

    return supportsMulberry;
  };
};

mulberry._loadDeviceConfig();
