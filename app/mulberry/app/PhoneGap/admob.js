dojo.provide('mulberry.app.PhoneGap.admob');
/**
 * Phonegap AdMob plugin
 * Copyright (c) Robert Wallström, Smithimage 2011
 *
 */
mulberry.app.PhoneGap.admob = function(pg, device) {
  function AdMob(){
  }
  var os = device.os,
      init = {
        ios : function() {
          AdMob.prototype.callbackMap = {};
          AdMob.prototype.callbackIdx = 0;

          AdMob.prototype.createBanner = function(options) {
              PhoneGap.exec("AdMob.createBanner", options);
          };

          AdMob.prototype.loadBanner = function(options) {
              PhoneGap.exec("AdMob.loadBanner", options);
          };

          AdMob.prototype.moveBanner = function(options) {
              PhoneGap.exec("AdMob.moveBanner", options);
          };

          AdMob.prototype.deleteBanner = function() {
              PhoneGap.exec("AdMob.deleteBanner", []);
          };


          AdMob.prototype.didFailToReceiveAdWithErrorCallback = function() {
              alert("Banner failed to receive ad with error");
          };

          AdMob.prototype.adViewDidDismissScreenCallback = function() {
              alert("Banner was dismissed");
          };

          AdMob.prototype.adViewDidReceiveAdCallback = function() {
              alert("Banner reveived ad");
          };

          AdMob.prototype.adViewWillDismissScreenAdCallback = function() {
              alert("Banner will be dismissed");
          };

          AdMob.prototype.adViewWillLeaveApplicationCallback = function() {
              alert("Will leave application");
          };

          AdMob.prototype.adViewWillPresentScreenCallback = function() {
              alert("Will present screen");
          };
          cordova.addConstructor(function() {
              if(!window.plugins)
              {
                  window.plugins = {};
              }
              window.plugins.adMob = new AdMob();
          });
        },
        android: function () {

        }
      };
      if (pg && init[os]) {
        init[os]();
      }
};