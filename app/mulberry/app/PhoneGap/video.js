dojo.provide('mulberry.app.PhoneGap.video');
/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */
mulberry.app.PhoneGap.video = function(pg, device){
  function VideoPlayer() { }

  var os = device.os,
      init = {
        ios : function() {
          //this should never be needed anyway
        },

        android : function() {
          VideoPlayer.prototype.play = function(url) {
            cordova.exec(null, null, "VideoPlayer", "playVideo", [url]);
          };

          /**
          * Load VideoPlayer
          */
          cordova.addConstructor(function() {
            cordova.addPlugin("videoPlayer", new VideoPlayer());
          });
        }
      };

  if (pg && init[os]) {
    init[os]();
  }
  return {
    play: function(url) {
      window.plugins.videoPlayer.play(url);
    }
  };
};