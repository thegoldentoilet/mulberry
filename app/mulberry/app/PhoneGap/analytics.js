dojo.provide('mulberry.app.PhoneGap.analytics');

mulberry.app.PhoneGap.analytics = function(pg, device){

  function getPlugin() {
    return window.plugins[pluginName];
  }

  var pluginName,
      pluginMethodNameMap,
      wrapper = {
        startTracker: function(accountId) {
          getPlugin()[pluginMethodNameMap.startTracker](accountId);
        },

        trackPageview: function(pageUri) {
          this.setCustomVariables();
          getPlugin()[pluginMethodNameMap.trackPageview](pageUri);
        },

        trackEvent: function(category, action, label, value) {
          this.setCustomVariables();
          getPlugin()[pluginMethodNameMap.trackEvent](category, action, label, value);
        },

        setCustomVariable: function(index, name, value) {
          getPlugin()[pluginMethodNameMap.setCustomVariable](index, name, value);
        },

        setCustomVariables: function() {
          console.log("Setting custom variables: deviceType: " + mulberry.Device.type + ", deviceOs: " + mulberry.Device.os)
          this.setCustomVariable(1, "deviceType", mulberry.Device.type);
          this.setCustomVariable(2, "deviceOs", mulberry.Device.os);
        }
      },
      os = device.os,
      init = {
        browser : function() {
          function Analytics() {}
          
          Analytics.prototype.startTracker: function(accountId) {
             _gaq.push(['_setAccount', accountId]);
          };
  
          Analytics.prototype.trackPageview: function(pageUri) {
            _gaq.push(['_trackPageview', pageUri]);
          };
  
          Analytics.prototype.trackEvent: function(category, action, label, value) {
            _gaq.push(['_trackEvent', category, action, label, value]);
          };
  
          Analytics.prototype.setCustomVariable: function(index, name, value) {
            _gaq.push(['_setCustomVar', index, name, value]);
          };  
         
          pluginMethodNameMap = {
            startTracker      : 'startTracker',
            trackPageview     : 'trackPageview',
            trackEvent        : 'trackEvent',
            setCustomVariable : 'setCustomVariable'
          };
        },
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

          pluginName = 'googleAnalyticsPlugin';
          pluginMethodNameMap = {
            startTracker      : 'startTrackerWithAccountID',
            trackPageview     : 'trackPageview',
            trackEvent        : 'trackEvent',
            setCustomVariable : 'setCustomVariable'
          };
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

          pluginName = 'analytics';
          pluginMethodNameMap = {
            startTracker      : 'start',
            trackPageview     : 'trackPageView',
            trackEvent        : 'trackEvent',
            setCustomVariable : 'setCustomVar'
          };

        }
      };

  if (pg && init[os]) {
    init[os]();
  } else {
    function noop() {}
    dojo.forEach([
      'startTracker', 'trackPageview', 'trackEvent', 'setCustomVariable'
      ], function(name) {
        wrapper[name] = noop;
      });
  }

  return wrapper;

};

