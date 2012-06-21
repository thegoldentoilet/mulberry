dojo.provide('mulberry.base');

$m = mulberry;
mulberry.version = '0.3';
mulberry.handleUnsupportedBrowser = function () {
  var loc = window.location;
  window.location = loc.protocol + "//"  + loc.host + loc.pathname + "unsupported.html";
};

dojo.require('mulberry.app.Config');

dojo.require('mulberry.Device');

if (!mulberry.Device.supportedBrowser()) {
  mulberry.handleUnsupportedBrowser();
}

dojo.require('mulberry._Logging');
dojo.require('mulberry._PageDef');
dojo.require('mulberry._Store');
dojo.require('mulberry._Model');
dojo.require('mulberry._Capability');

dojo.require('mulberry.Utilities');

dojo.require('mulberry.app._base');

dojo.requireLocalization('mulberry', 'mulberry');

var readyFn = function() {
  try {
    // open up the database connection so we can work with it
    mulberry.app.DeviceStorage.init(mulberry.app.Config.get("id") || 'mulberry');

    // bootstrapping process should start in response to /app/deviceready
    dojo.publish('/app/deviceready');

    // bootstrapping process must publish this topic
    dojo.subscribe('/app/ready', function() {
      mulberry.app.Router.init();
      mulberry.app.UI.hideSplash();
    });
  } catch (e) {
    if (mulberry.Device.environment === 'browser') {
      mulberry.handleUnsupportedBrowser();
    } else {
      throw e;
    }
  }
};

document.addEventListener("deviceready", function() {
  dojo.ready(readyFn);
}, false);

