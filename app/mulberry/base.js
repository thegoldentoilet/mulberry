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

var fixPix = function() {
  var pix = (window.outerHeight-54) + "px";        
  dojo.style(document.body, 'height', pix);  
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
    alert(mulberry.Device.os);
    if(mulberry.Device.os === 'android'){
      fixPix();
      
      dojo.connect("onorientationchange", function() {
        setTimeout(function() {
          fixPix();
        }, 200);
      });
    }
  });
};

document.addEventListener("deviceready", function() {
  dojo.ready(readyFn);
}, false);

