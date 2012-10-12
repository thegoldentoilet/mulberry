  dojo.provide('mulberry.app.PhoneGap.admob');
/**
 * Phonegap AdMob plugin
 * Copyright (c) Robert Wallström, Smithimage 2011
 *
 */
mulberry.app.PhoneGap.admob = function (pg, device) {
  function AdMob () { }

  var os = device.os,
      init = {
        ios : function () {
          AdMob.prototype.callbackMap = {};
          AdMob.prototype.callbackIdx = 0;

          AdMob.prototype.createBanner = function (siteId, deviceType, successCallback, failureCallback) {
              var options = {siteId : siteId,
                             deviceType : deviceType};

              PhoneGap.exec("AdMob.createBanner", options);
              PhoneGap.exec("AdMob.loadBanner", options);
          };

          AdMob.prototype.moveBanner = function (siteId, deviceType, positionX, positionY, height, width, successCallback, failureCallback) {
              var options = {siteId : siteId,
                positionX : positionX,
                positionY : positionY,
                height : height,
                width : width
              };

              PhoneGap.exec("AdMob.moveBanner", options);
          };

          AdMob.prototype.deleteBanner = function (successCallback, failureCallback) {
              PhoneGap.exec("AdMob.deleteBanner", []);
          };

          cordova.addConstructor(function() {
            if (!window.plugins)
            {
                window.plugins = {};
            }
            window.plugins.adMob = new AdMob();
          });
        },
        android: function () {
          AdMob.prototype.callbackMap = {};
          AdMob.prototype.callbackIdx = 0;

          AdMob.prototype.createBanner = function (siteId, deviceType, successCallback, failureCallback) {
              PhoneGap.exec(successCallback, failureCallback, "AdMob", "createBanner", [siteId, deviceType]);
          };

          AdMob.prototype.deleteBanner = function (successCallback, failureCallback) {
              PhoneGap.exec(successCallback, failureCallback, "AdMob", "deleteBanner", []);
          };

          AdMob.prototype.moveBanner = function (siteId, deviceType, positionX, positionY, height, width, successCallback, failureCallback) {
           // not needed in Android
          };

          cordova.addConstructor(function () {
            if (!window.plugins)
            {
                window.plugins = {};
            }
            window.plugins.adMob = new AdMob();
          });
        }
      };
      if (pg && init[os]) {
        init[os]();
      }
};