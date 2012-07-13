dojo.provide('mulberry.app.PhoneGap.audio');

dojo.declare('mulberry.app.PhoneGap.audio', null, {
  audioSuccess : function() { },
  audioError : function(err) { },

  constructor : function( ) {
    if (!window.cordova) { return; }
    this.audio = null;
  },

  play : function(url) {
    console.log('mulberry.app.PhoneGap.audio::play()');

    if (!window.cordova) { return; }
    
    if (url) {
      url = /^http/.test(url) ? url : ('/android_asset/www/' + url);
      this.setNewAudio(url);
    }

    if(!this.audio) { return; }
    this.audio.play();
  },

  stop : function() {
    console.log('mulberry.app.PhoneGap.audio::stop()');

    if (!window.cordova || !this.audio) { return; }

    this.audio.pause();
  },

  getDuration : function() {
    if (!window.cordova || !this.audio) { return; }

    return this.audio.getDuration();
  },

  getCurrentPosition : function() {
    if (!window.cordova || !this.audio) { return; }

    var dfd = new dojo.Deferred();

    this.audio.getCurrentPosition(function(position) {
      dfd.resolve(position);
    });

    return dfd.promise;
  },

  seekTo : function(point /* milliseconds */) {
    if (!window.cordova || !this.audio) { return; }

    return this.audio.seekTo(point);
  },

  setNewAudio : function(url) {
    this.destroy();
    this.audio = new Media(url, this.audioSuccess, this.audioError);
  },

  destroy : function() {
    if (!this.audio) { return; }
    this.audio.stop();
    this.audio.release();
    this.audio = null;
  },

  commaStopper : false
});
