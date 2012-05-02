dojo.provide('mulberry.app.PhoneGap.browser');

/* MIT licensed */
// (c) 2012 Jesse MacFadyen, Nitobi

/*global Cordova */

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
          /*
           * Copyright (c) 2005-2010, Nitobi Software Inc.
           * Copyright (c) 2010, IBM Corporation
           */

          ChildBrowser.prototype.showWebPage = function(url, usePhoneGap) {
            cordova.exec(null, null, "ChildBrowser", "showWebPage", [url, usePhoneGap]);
          };

          cordova.addConstructor(function() {
            cordova.addPlugin("childBrowser", new ChildBrowser());
            PluginManager.addService("ChildBrowser", "com.phonegap.plugins.childBrowser.ChildBrowser");
          });
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

