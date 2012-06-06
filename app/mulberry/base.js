dojo.provide('mulberry.base');

$m = mulberry;
mulberry.version = '0.3';
dojo.require('mulberry.app.Config');

dojo.require('mulberry.Device');

dojo.require('mulberry._Logging');
dojo.require('mulberry._PageDef');
dojo.require('mulberry._Store');
dojo.require('mulberry._Model');
dojo.require('mulberry._Capability');

dojo.require('mulberry.Utilities');

dojo.require('mulberry.app._base');

dojo.requireLocalization('mulberry', 'mulberry');

var fixHeight = function(pixels) {
  if(!pixels) {
    var pixels = pixels ? pixels : (window.outerHeight-54) + "px";    
    mulberry.Device.heightHash[window.orientation] = pixels;
  }
  
  dojo.style(document.body, 'height', pixels);
};

var readyFn = function() {
  // open up the database connection so we can work with it
  mulberry.app.DeviceStorage.init(mulberry.app.Config.get("id") || 'mulberry');

  // bootstrapping process should start in response to /app/deviceready
  dojo.publish('/app/deviceready');

  // bootstrapping process must publish this topic
  dojo.subscribe('/app/ready', function() {

    mulberry.app.Router.init();
    mulberry.app.UI.hideSplash();
    mulberry.Device.heightHash = {};
    if(mulberry.Device.os === 'browser' && mulberry.Device.browserOS === 'android'){
      fixHeight();
      dojo.connect(window, "resize", function() {
        if(mulberry.Device.heightHash[window.orientation] ) {
          fixHeight(mulberry.Device.heightHash[window.orientation]);
        } else {
          setTimeout(function() {
            fixHeight();
          }, 250);
        }
      });
    }
  });
};

document.addEventListener("deviceready", function() {
  dojo.ready(readyFn);
}, false);

