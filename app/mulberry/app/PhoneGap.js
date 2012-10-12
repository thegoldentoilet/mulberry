dojo.provide('mulberry.app.PhoneGap');

dojo.require('mulberry.Device');
dojo.require('mulberry.app.PhoneGap.analytics');
dojo.require('mulberry.app.PhoneGap.notification');
dojo.require('mulberry.app.PhoneGap.device');
dojo.require('mulberry.app.PhoneGap.network');
dojo.require('mulberry.app.PhoneGap.audio');
dojo.require('mulberry.app.PhoneGap.push');
dojo.require('mulberry.app.PhoneGap.browser');
dojo.require('mulberry.app.PhoneGap.camera');
dojo.require('mulberry.app.PhoneGap.geolocation');
dojo.require('mulberry.app.PhoneGap.accelerometer');
dojo.require('mulberry.app.PhoneGap.video');
dojo.require('mulberry.app.PhoneGap.admob');

(function() {
  mulberry.app.PhoneGap.registerAPI = function(name, module) {
    var s = dojo.subscribe('/app/deviceready', function() {
      var device = mulberry.Device,
          phonegapPresent = mulberry.app.PhoneGap.present = !!window.cordova;
      mulberry.app.PhoneGap[name] = module(phonegapPresent, device);
      dojo.unsubscribe(s);
    });
  };

  var builtInAPIs = [
    'analytics',
    'notification',
    'device',
    'network',
    'audio',
    'push',
    'browser',
    'camera',
    'geolocation',
    'accelerometer',
    'video',
    'admob'
  ];

  dojo.forEach(builtInAPIs, function(apiName) {
    mulberry.app.PhoneGap.registerAPI(apiName, mulberry.app.PhoneGap[apiName]);
  });
}());
