dojo.provide('mulberry.app.PhoneGap.analytics');

mulberry.app.PhoneGap.analytics = function(pg, device){

  var wrapper = {},
      os = device.os,
      init = {
        ios : function() {
          function GoogleAnalyticsPlugin() {}

          GoogleAnalyticsPlugin.prototype.startTrackerWithAccountID = function(id) {
          	PhoneGap.exec("GoogleAnalyticsPlugin.startTrackerWithAccountID",id);
          };

          GoogleAnalyticsPlugin.prototype.trackPageview = function(pageUri) {
          	PhoneGap.exec("GoogleAnalyticsPlugin.trackPageview",pageUri);
          };

          GoogleAnalyticsPlugin.prototype.trackEvent = function(category,action,label,value) {
          	var options = {category:category,
          		action:action,
          		label:label,
          		value:value};
          	PhoneGap.exec("GoogleAnalyticsPlugin.trackEvent",options);
          };

          GoogleAnalyticsPlugin.prototype.setCustomVariable = function(index,name,value) {
          	var options = {index:index,
          		name:name,
          		value:value};
          	PhoneGap.exec("GoogleAnalyticsPlugin.setCustomVariable",options);
          };

          GoogleAnalyticsPlugin.prototype.hitDispatched = function(hitString) {
          	//console.log("hitDispatched :: " + hitString);
          };
          GoogleAnalyticsPlugin.prototype.trackerDispatchDidComplete = function(count) {
          	//console.log("trackerDispatchDidComplete :: " + count);
          };

          PhoneGap.addConstructor(function() {
            if(!window.plugins) window.plugins = {};
            window.plugins.googleAnalyticsPlugin = new GoogleAnalyticsPlugin();
          });

          function getPlugin() {
            return window.plugins.googleAnalyticsPlugin;
          }

          wrapper.startTracker = function(accountId) {
            getPlugin().startTrackerWithAccountID(accountId);
          }

          wrapper.trackPageview = function(pageUri) {
            getPlugin().trackPageview(pageUri);
          }

          wrapper.setCustomVariable = function(index, name, value) {
            getPlugin().setCustomVariable(index, name, value);
          }

        },

        android : function() {
          /**
           * Constructor
           */
          function Analytics() {
          }

          /**
           * Initialize Google Analytics configuration
           *
           * @param accountId			The Google Analytics account id
           * @param successCallback	The success callback
           * @param failureCallback	The error callback
           */
          Analytics.prototype.start = function(accountId, successCallback, failureCallback) {
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
           * 							The key name will be presented in Google Analytics report.
           * @param successCallback	The success callback
           * @param failureCallback	The error callback
           */
          Analytics.prototype.trackPageView = function(key, successCallback, failureCallback) {
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

          Analytics.prototype.trackEvent = function(category, action, label, value, successCallback, failureCallback){
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

          Analytics.prototype.setCustomVar = function(index, label, value, scope, successCallback, failureCallback){
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
          	PhoneGap.addPlugin('analytics', new Analytics());

          //	@deprecated: No longer needed in PhoneGap 1.0. Uncomment the addService code for earlier
          //	PhoneGap releases.
          // 	PluginManager.addService("GoogleAnalyticsTracker", "com.phonegap.plugins.analytics.GoogleAnalyticsTracker");
          });

          function getPlugin() {
            return window.plugins.analytics;
          }

          wrapper.startTracker = function(accountId) {
            getPlugin().start(accountId);
          }

          wrapper.trackPageview = function(pageUri) {
            getPlugin().trackPageView(pageUri);
          }

          wrapper.setCustomVariable = function(index, name, value) {
            getPlugin().setCustomVar(index, name, value);
          }
        }
      };

  if (pg && init[os]) {
    init[os]();
  }

  return wrapper;

};

