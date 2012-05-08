dojo.provide('mulberry.app.PhoneGap.browser');

// This is adapted from code that is
// available under *either* the terms of the modified BSD license *or* the
// MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
//
// Copyright (c) 2005-2010, Nitobi Software Inc.
// Copyright (c) 2011, IBM Corporation

mulberry.app.PhoneGap.browser = function(pg, device){
  function ChildBrowser() { }
  window.ChildBrowser = ChildBrowser;

  var os = device.os,
      init = {
        ios : function() {
          var cordovaRef = window.PhoneGap || window.Cordova || window.cordova; // old to new fallbacks

          // Callback when the location of the page changes
          // called from native
          ChildBrowser._onLocationChange = function(newLoc)
          {
              window.plugins.childBrowser.onLocationChange(newLoc);
          };

          // Callback when the user chooses the 'Done' button
          // called from native
          ChildBrowser._onClose = function()
          {
              window.plugins.childBrowser.onClose();
          };

          // Callback when the user chooses the 'open in Safari' button
          // called from native
          ChildBrowser._onOpenExternal = function()
          {
              window.plugins.childBrowser.onOpenExternal();
          };

          // Pages loaded into the ChildBrowser can execute callback scripts, so be careful to
          // check location, and make sure it is a location you trust.
          // Warning ... don't exec arbitrary code, it's risky and could fuck up your app.
          // called from native
          ChildBrowser._onJSCallback = function(js,loc)
          {
              // Not Implemented
              //window.plugins.childBrowser.onJSCallback(js,loc);
          };

          /* The interface that you will use to access functionality */

          // Show a webpage, will result in a callback to onLocationChange
          ChildBrowser.prototype.showWebPage = function(loc)
          {
              cordovaRef.exec("ChildBrowserCommand.showWebPage", loc);
          };

          // close the browser, will NOT result in close callback
          ChildBrowser.prototype.close = function()
          {
              cordovaRef.exec("ChildBrowserCommand.close");
          };

          // Not Implemented
          ChildBrowser.prototype.jsExec = function(jsString)
          {
              // Not Implemented!!
              //PhoneGap.exec("ChildBrowserCommand.jsExec",jsString);
          };

          // Note: this plugin does NOT install itself, call this method some time after deviceready to install it
          // it will be returned, and also available globally from window.plugins.childBrowser
          ChildBrowser.install = function()
          {
              if(!window.plugins) {
                  window.plugins = {};
              }
                  if ( ! window.plugins.childBrowser ) {
                  window.plugins.childBrowser = new ChildBrowser();
              }

          };


          if (cordovaRef && cordovaRef.addConstructor) {
              cordovaRef.addConstructor(ChildBrowser.install);
          } else {
              console.log("ChildBrowser Cordova Plugin could not be installed.");
              return null;
          }

          ChildBrowser.install();
        },

        android : function() {
          ChildBrowser.CLOSE_EVENT = 0;
          ChildBrowser.LOCATION_CHANGED_EVENT = 1;

          /**
           * Display a new browser with the specified URL.
           * This method loads up a new web view in a dialog.
           *
           * @param url           The url to load
           * @param options       An object that specifies additional options
           */
          ChildBrowser.prototype.showWebPage = function(url, options) {
              if (options === null || options === "undefined") {
                  var options = new Object();
                  options.showLocationBar = true;
              }
              cordova.exec(this._onEvent, this._onError, "ChildBrowser", "showWebPage", [url, options]);
          };

          /**
           * Close the browser opened by showWebPage.
           */
          ChildBrowser.prototype.close = function() {
              cordova.exec(null, null, "ChildBrowser", "close", []);
          };

          /**
           * Display a new browser with the specified URL.
           * This method starts a new web browser activity.
           *
           * @param url           The url to load
           * @param usecordova   Load url in cordova webview [optional]
           */
          ChildBrowser.prototype.openExternal = function(url, usecordova) {
              if (usecordova === true) {
                  navigator.app.loadUrl(url);
              }
              else {
                  cordova.exec(null, null, "ChildBrowser", "openExternal", [url, usecordova]);
              }
          };

          /**
           * Method called when the child browser has an event.
           */
          ChildBrowser.prototype._onEvent = function(data) {
              if (data.type == ChildBrowser.CLOSE_EVENT && typeof window.plugins.childBrowser.onClose === "function") {
                  window.plugins.childBrowser.onClose();
              }
              if (data.type == ChildBrowser.LOCATION_CHANGED_EVENT && typeof window.plugins.childBrowser.onLocationChange === "function") {
                  window.plugins.childBrowser.onLocationChange(data.location);
              }
          };

          /**
           * Method called when the child browser has an error.
           */
          ChildBrowser.prototype._onError = function(data) {
              if (typeof window.plugins.childBrowser.onError === "function") {
                  window.plugins.childBrowser.onError(data);
              }
          };

          /**
           * Maintain API consistency with iOS
           */
          ChildBrowser.install = function(){
              return window.plugins.childBrowser;
          };

          /**
           * Load ChildBrowser
           */
          cordova.addConstructor(function() {
              cordova.addPlugin("childBrowser", new ChildBrowser());
          });

          ChildBrowser.install();

        }
      };

  if (pg && init[os]) {
    init[os]();
  }

  return {
    url : function(url) {
      if (pg) {
        if (os === 'android') {
          cordova.exec(null, null, 'ChildBrowser', 'showWebPage', [url, false]);
        } else {
          window.plugins.childBrowser.showWebPage(url);
        }
        return;
      }

      window.location = url;
    },

    getBrowser : function() {
      if (!window.plugins.childBrowser) {
        throw new Error("Can't find childBrowser plugin");
      }

      return window.plugins.childBrowser;
    }
  };

};

