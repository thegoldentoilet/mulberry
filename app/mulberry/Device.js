dojo.provide('mulberry.Device');

dojo.require('mulberry.Utilities');
dojo.require('mulberry.app.Config');

/*mulberry.Device consists of:
 - Device.os = iOS or Android regardless of native or web execution
 - Device.osVersion = os version number
 - Device.environment = browser or native //may not be neededok
 - Device.type = phone or tablet
 - Device.browserVersion = browser version number
 - Device.standalone = true if running from home screen in iOS
*/

(function() {
  var device = function() {
    var uaParsers = dojo.clone(this.defaultUAParsers),
        parser, deviceFill;

    dojo.mixin(this, mulberry.app.Config.get('device'));

    this.environment = this.os && this.os != "browser" ? 'native' : 'browser';
    this.standalone = !!navigator.standalone;

    if (this.environment == 'native') {
      deviceFill = dojo.subscribe('/app/deviceready', dojo.hitch(this, function() {
        if ('device' in window) {
          // PhoneGap writes device info straight to window
          mulberry.Device.osVersion = window.device.version;
        }
        dojo.unsubscribe(deviceFill);
      }));
    }

    // we're all done
    if (this.os && this.os != "browser") { return; }

    this.type = this.getDeviceType();

    // we have to assemble the device data or at least the browser data
    this.ua = window.navigator.userAgent;

    uaParsers = this.setUAParsers(uaParsers);

    for (parser in uaParsers) {
      this[parser] = uaParsers[parser](this.ua);
    }
  };

  device.prototype = {
    defaultUAParsers : {
      os : function() { return 'desktop'; },
      osVersion : function() { return -1; },
      browserVersion : function() { return -1; }
    },

    userAgentParsers : {
      'ios' : {
        re : /(iPhone|iPod|iPad)/,
        parsers : {
          os : function() { return 'ios'; },
          osVersion : function(ua) {
            var vnum = parseFloat(ua.match(/([\d_]+) like Mac OS X/)[1].replace('_', '.'));
            if (!vnum) { return -1; }
            return vnum;
          },
          browserVersion : function() { return dojo.isWebKit || -1; }
        }
      },
      'android' : {
        re : /(Android)/,
        parsers : {
          os : function() { return 'android'; },
          osVersion : function(ua) {
            var vnum = parseFloat(ua.match(/Android ([\d\.]+)/)[1]);
            if (!vnum) { return -1; }
            return vnum;
          },
          browserVersion : function() { return dojo.isWebKit || -1; }
        }
      },
      'mac' : {
        re: /(Macintosh)/,
        parsers : {
          os: function() { return 'mac'; },
          osVersion: function(ua) {
            var vnum = ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.');
            if (!vnum) { return -1; }
            return vnum;
          },
          browserVersion : function() { return dojo.isWebKit || -1; }
        }
      },
      'windows' : {
        re: /(Windows)/,
        parsers : {
          os: function() { return 'windows'; },
          osVersion: function(ua) {
            var vnum = parseFloatsws(ua.match(/Windows NT ([\d\.]+)/i)[1]);
            if (!vnum) { return -1; }
            return vnum;
          },
          browserVersion : function(ua) { return dojo.isWebKit || -1; }
        }
      }
    },

    setUAParsers : function(parsers) {
      dojo.forIn(this.userAgentParsers, dojo.hitch(this, function(osName, osObj) {
        if (this.ua.search(osObj.re) > -1) {
          dojo.mixin(parsers, osObj.parsers);
        }
      }));
      return parsers;
    },

    getDeviceType : function() {
      var body = dojo.body(),
          minDim = Math.min(body.offsetWidth, body.offsetHeight);

      return minDim > 640 ? 'tablet' : 'phone';
    },

    supportedBrowser : function() {
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
      alert('supports websql: ' + supportsWebSql);
      isOldAndroid = device.environment === 'browser' && device.os === 'android' && device.browserVersion < 2.2;

      supportsMulberry = supportsWebkitPrefixes &&
                         supportsWebSql &&
                         !isOldAndroid;

      return supportsMulberry;
    }
  };

  mulberry.Device = new device();
  alert(mulberry.Device.environment + " " + mulberry.Device.os);
}());