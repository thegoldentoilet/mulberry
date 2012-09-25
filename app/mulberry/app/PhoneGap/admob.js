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
          console.log("in admob ios");
          AdMob.prototype.callbackMap = {};
          AdMob.prototype.callbackIdx = 0;
          //loadBanner is the preferred method to set up new banner ads.
          AdMob.prototype.createBanner = function(siteId,positionX,positionY,height,width,latitude,longitude) {
              var options = {siteId:siteId,
                positionX:positionX,
                positionY:positionY,
                height:height,
                width:width,
                latitude:latitude,
                longitude:longitude
              };
              PhoneGap.exec("AdMob.createBanner", options);
          };

          AdMob.prototype.loadBanner = function(siteId,positionX,positionY,height,width,latitude,longitude) {
              var options = {siteId:siteId,
                positionX:positionX,
                positionY:positionY,
                height:height,
                width:width,
                latitude:latitude,
                longitude:longitude
              };
              PhoneGap.exec("AdMob.loadBanner", options);
          };

          AdMob.prototype.moveBanner = function(siteId,positionX,positionY,height,width,latitude,longitude) {
              var options = {siteId:siteId,
                positionX:positionX,
                positionY:positionY,
                height:height,
                width:width,
                latitude:latitude,
                longitude:longitude
              };
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
          AdMob.prototype.callbackMap = {};
          AdMob.prototype.callbackIdx = 0;
          //loadBanner is the preferred method to set up new banner ads.
          AdMob.prototype.createBanner = function(siteId,positionX,positionY,height,width,latitude,longitude,successCallback,failureCallback) {
              console.log("in admob createbanner");
              //PhoneGap.exec(successCallback,failureCallback,"AdMob","createBanner", [siteId]);
          };

          AdMob.prototype.loadBanner = function(siteId,positionX,positionY,height,width,latitude,longitude,successCallback,failureCallback) {
              console.log("in admob loadBanner but really calling createBanner");
              PhoneGap.exec(successCallback,failureCallback,"AdMob","createBanner", [siteId, 0, 430]);
          };

          AdMob.prototype.deleteBanner = function() {
              console.log("in admob deleteBanner");
              PhoneGap.exec(successCallback,failureCallback,"AdMob","deleteBanner", []);
          };

          AdMob.prototype.moveBanner = function(siteId,positionX,positionY,height,width,latitude,longitude) {
           //also not implemented in Android?
          };
          cordova.addConstructor(function() {
            if(!window.plugins)
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