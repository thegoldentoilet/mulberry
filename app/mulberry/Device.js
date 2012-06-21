dojo.provide('mulberry.Device');

dojo.require('mulberry.Utilities');
dojo.require('mulberry.app.Config');

/*mulberry.Device consists of:
 - Device.os = iOS or Android regardless of native or web execution
 - Device.osVersion = os version number
 - Device.environment = browser or native //may not be neededok
 - Device.type = phone or tablet
 - Device.browser = browser user agent, if truthy, then app is mobile web
 - Device.browserVersion = browser version number
 - Device.standalone = true if running from home screen in iOS
*/

mulberry.loadDeviceConfig = function() {
  var browserDevices = {
    'ios' : {
      re : /(iPhone|iPod|iPad)/,
      version: function(ua) {
        var vnum = parseFloat(ua.match(/([\d_]+) like Mac OS X/)[1].replace('_', '.'));
        if (!vnum) { return -1; }
        return vnum;
      },
      browser: function() { return dojo.isWebKit || -1; }
    },
    'android' : {
      re : /(Android)/,
      version: function(ua) {
        var vnum = parseFloat(ua.match(/Android ([\d\.]+)/)[1]);
        if (!vnum) { return -1; }
        return vnum;
      },
      browser: function() { return dojo.isWebKit || -1; }
    },
    'mac' : {
      re: /(Macintosh)/,
      version: function(ua) {
        var vnum = ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.');
        if (!vnum) { return -1; }
        return vnum;
      },
      browser: function() { return dojo.isWebKit || -1; }
    },
    'windows' : {
      re: /(Windows)/,
      version: function(ua) {
        var vnum = parseFloatsws(ua.match(/Windows NT ([\d\.]+)/i)[1]);
        if (!vnum) { return -1; }
        return vnum;
      },
      browser: function(ua) { return dojo.isWebKit || -1; }
    }
  };

  //holding place for sniffed UA attributes
  var userAgentValues = {};

  //determines dimensions of browser window to test tablet or phone layouts
  function getDeviceType() {
    var body = dojo.body(),
        minDim = Math.min(body.offsetWidth, body.offsetHeight);

    return minDim > 640 ? 'tablet' : 'phone';
  }

  //uses the UA string to determine what browser, OS, and version
  //sets to temporary object
  (function sniff() {
    var ua = window.navigator.userAgent;
    dojo.forIn(browserDevices, function(osName, osObj) {
      if (ua.search(osObj.re) > -1) {
        userAgentValues.os = osName;
        userAgentValues.osVersion = browserDevices[osName].version(ua);
        userAgentValues.browserVersion = browserDevices[osName].browser();
        userAgentValues.browser = userAgentValues.browserVersion !== -1 ? 'webkit' : 'unsupported';
      }
    });
    
    if (!userAgentValues.os) {
      userAgentValues.os = 'unsupported';
      userAgentValues.browserVersion = -1;
      userAgentValues.osVersion = -1;
      userAgentValues.browser = 'unsupported';
    }
    userAgentValues.type = getDeviceType();
  })();

  mulberry.Device = mulberry.app.Config.get('device') || {};
  if (typeof mulberry.Device.os === "undefined" || mulberry.Device.os === 'browser') {
    mulberry.Device.os = userAgentValues.os;
    mulberry.Device.environment = 'browser';
  } else {
    mulberry.Device.environment = 'native';
  }
  mulberry.Device.type = mulberry.Device.type || userAgentValues.type;
  mulberry.Device.osVersion = userAgentValues.osVersion;
  mulberry.Device.browserVersion = userAgentValues.browserVersion;
  mulberry.Device.standalone = !!navigator.standalone;
  mulberry.Device.browser = userAgentValues.browser;
  
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

    var div = document.createElement('div'),
        device = mulberry.Device,
        supportsMulberry,
        supportsWebSql,
        supportsWebkitPrefixes,
        isOldAndroid;

    if (device.environment != 'browser') {
      return true;
    }

    if (window.location.hostname === 'localhost') {
      return true;
    }

    supportsWebkitPrefixes = typeof div.style.webkitTransform !== 'undefined';
    supportsTouch = 'ontouchstart' in document.documentElement;

    // this check is to allow desktop browser support which don't have ontouchstart
    if (!supportsTouch && (device.os === 'android' || device.os === 'ios')) {
      return false; //android and ios devices need to support touch
    }
    supportsWebSql = 'openDatabase' in window;
    isOldAndroid = device.environment === 'browser' && device.os === 'android' && device.browserVersion < 2.2;

    supportsMulberry = supportsWebkitPrefixes &&
                       supportsWebSql &&
                       !isOldAndroid;

    return supportsMulberry;
  };
};

mulberry.loadDeviceConfig();
