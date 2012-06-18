dojo.provide('mulberry.app.PhoneGap.analytics');

mulberry.app.PhoneGap.analytics = function(pg, device){

  var os = device.os,
      init = {
        ios : function() {
          mulberry.app.Analytics.prototype.startTracker = function(id) {
            PhoneGap.exec("GoogleAnalyticsPlugin.startTrackerWithAccountID",id);
          };

          mulberry.app.Analytics.prototype.trackPageview = function(pageUri) {
            PhoneGap.exec("GoogleAnalyticsPlugin.trackPageview",pageUri);
          };

          mulberry.app.Analytics.prototype.trackEvent = function(category,action,label,value) {
            var options = {category:category,
              action:action,
              label:label,
              value:value};
            PhoneGap.exec("GoogleAnalyticsPlugin.trackEvent",options);
          };

          mulberry.app.Analytics.prototype.setCustomVariable = function(index,name,value) {
            var options = {index:index,
              name:name,
              value:value};
            PhoneGap.exec("GoogleAnalyticsPlugin.setCustomVariable",options);
          };

          mulberry.app.Analytics.prototype.hitDispatched = function(hitString) {
          //console.log("hitDispatched :: " + hitString);
          };
          mulberry.app.Analytics.prototype.trackerDispatchDidComplete = function(count) {
          //console.log("trackerDispatchDidComplete :: " + count);
          };

          PhoneGap.addConstructor(function() {
            if(!window.plugins) window.plugins = {};
            window.plugins.googleAnalyticsPlugin = new mulberry.app.Analytics();
          });
        },

        android : function() {
          /**
           * Initialize Google Analytics configuration
           *
           * @param accountId			The Google Analytics account id
           * @param successCallback	The success callback
           * @param failureCallback	The error callback
           */
          mulberry.app.Analytics.prototype.startTracker = function(accountId, successCallback, failureCallback) {
            return PhoneGap.exec(
              successCallback,
              failureCallback,
              'GoogleAnalyticsTracker',
              'start',
              [accountId]);
          };

          /**
           * Track a page view on Google Analytics
           * @param key				The name of the tracked item (can be a url or some logical name).
           * The key name will be presented in Google Analytics report.
           * @param successCallback	The success callback
           * @param failureCallback	The error callback
           */
          mulberry.app.Analytics.prototype.trackPageview = function(key, successCallback, failureCallback) {
            return PhoneGap.exec(
              successCallback,
              failureCallback,
              'GoogleAnalyticsTracker',
              'trackPageView',
              [key]);
          };

          /**
           * Track an event on Google Analytics
           * @param category			The name that you supply as a way to group objects that you want to track
           * @param action			The name the type of event or interaction you want to track for a particular web object
           * @param label				Provides additional information for events that you want to track (optional)
           * @param value				Assign a numerical value to a tracked page object (optional)

           * @param successCallback	The success callback
           * @param failureCallback	The error callback
           */

          mulberry.app.Analytics.prototype.trackEvent = function(category, action, label, value, successCallback, failureCallback){
            return PhoneGap.exec(
              successCallback,
              failureCallback,
              'GoogleAnalyticsTracker',
              'trackEvent',
              [
                category,
                action,
                typeof label === "undefined" ? "" : label,
                (isNaN(parseInt(value,10))) ? 0 : parseInt(value, 10)
              ]);
          };

          mulberry.app.Analytics.prototype.setCustomVariable = function(index, label, value, scope, successCallback, failureCallback){
            return PhoneGap.exec(
              successCallback,
              failureCallback,
              'GoogleAnalyticsTracker',
              'setCustomVariable',
              [
                (isNaN(parseInt(index,10))) ? 0 : parseInt(index, 10),
                label,
                value,
                (isNaN(parseInt(scope,10))) ? 0 : parseInt(scope, 10)
              ]);
          };

          /**
           * Load Analytics
           */
          PhoneGap.addConstructor(function() {
            PhoneGap.addPlugin('analytics', new mulberry.app.Analytics());
          });
        }
      };

  if (pg && init[os]) {
    init[os]();
  }
  else if(!pg && !_gaq) {
    //this fix is to prevent mulberry serve from barfing when running in "device mode" and not having the _gaq object
    //a new fix should be devised when mulberry.Device gets refactored.
    var noop = function() {};
    dojo.forEach(['startTracker', 'trackPageview', 'trackEvent', 'setCustomVariable'
      ], function(name) {
        mulberry.app.Analytics.prototype[name] = noop;
      });
  }
};