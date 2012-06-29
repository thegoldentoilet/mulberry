dojo.provide('toura.components.AudioPlayer');

dojo.require('mulberry.app.PhoneGap');
dojo.require('toura.components._MediaPlayer');

dojo.declare('toura.components.AudioPlayer', toura.components._MediaPlayer, {
  templateString : dojo.cache('toura.components', 'AudioPlayer/AudioPlayer.haml'),

  playerType : 'audio',
  isPlaying : false,
  playerSettings : {
    preload : 'auto',
    controls : false,
    autobuffer : true
  },

  prepareData : function() {
    this.medias = this.node.audios || [];
    this.inherited(arguments);

    window.audioPlayer = this;
  },

  setupConnections : function() {
    this.inherited(arguments);

    this.connect(this.playpause, 'click', '_handleControllerClick');
    this.connect(this.rev30, 'click', '_reverse30seconds');
  },

  _handleControllerClick : function() {
    if (this.isPlaying) {
      this._pause();
      this.isPlaying = false;
      this.removeClass('playing');
    } else {
      this._play();
      this.isPlaying = true;
      this.addClass('playing');
    }
  },

  _reverse30seconds : function() {
    if (!this.isPlaying) { return; }
    this.seekRelativeTime(-30);
  },

  _setSpinnerPercent: function(percent /* 0 to 100 */) {
    var pct = percent/100;

    if(percent > 50) {
      this._transformDial(pct * 360 - 180);
      dojo.addClass(this.spinnerFill, "fill-side");
      dojo.addClass(this.spinnerDialContainer, "fill-side");
    } else {
      this._transformDial(pct * 360);
      dojo.removeClass(this.spinnerFill, "fill-side");
      dojo.removeClass(this.spinnerDialContainer, "fill-side");
    }

  },

  _transformDial : function(degrees) {
    dojo.style(this.spinnerDial, "-webkit-transform", "translateX(-50%) rotate(" + (degrees - 180) + "deg) translateX(50%)");
  },

  _play : function(media) {
    this.inherited(arguments);

    if (this.useHtml5Player) { return; }

    var pg = mulberry.app.PhoneGap;
    pg.audio.destroy();
    pg.audio.play(this.media.url);
  },

  _pause : function() {
    this.inherited(arguments);

    if (!this.useHtml5Player) {
      mulberry.app.PhoneGap.audio.stop();
    }
  },

  teardown : function() {
    if (!this.useHtml5Player) {
      // we used the phonegap player
      mulberry.app.PhoneGap.audio.destroy();
    }
  }

});
