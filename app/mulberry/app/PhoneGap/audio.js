dojo.provide('mulberry.app.PhoneGap.audio');

mulberry.app.PhoneGap.audio = function(pg, device) {
  var audio,
      audioSuccess = function() { },
      audioError = function(err) { };

  return {
    play : function(url) {
      console.log('mulberry.app.PhoneGap.audio::play()');

      if (!pg) { return; }

      url = /^http/.test(url) ? url : ('/android_asset/www/' + url);
      audio = new Media(url, audioSuccess, audioError);
      audio.play();
    },

    stop : function() {
      console.log('mulberry.app.PhoneGap.audio::stop()');

      if (!pg || !audio) { return; }

      audio.pause();
    },

    getCurrentPosition : function() {
      if (!pg || !audio) { return; }

      var dfd = new dojo.Deferred();

      audio.getCurrentPosition(function(position) {
        dfd.resolve(position);
      });

      return dfd.promise;
    },

    getDuration : function() {
      if (!pg || !audio) { return; }

      return audio.getDuration();
    },

    seekTo : function(point /* milliseconds */) {
      if (!pg || !audio) { return; }

      return audio.seekTo(point);
    },

    destroy : function() {
      if (!audio) { return; }

      audio.stop();
      audio.release();

      audio = null;
    }
  };
};
