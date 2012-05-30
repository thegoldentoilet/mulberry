(function(){
  supportedBrowser = function() {
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
                       supportsWebSql;

    alert('supportsMulberry=' + supportsMulberry);

    return supportsMulberry;
  };

  if (!supportedBrowser()){
    var loc = window.location;
    window.location = loc.protocol + "//"  + loc.host + loc.pathname + "unsupported.html";
  }
})();

