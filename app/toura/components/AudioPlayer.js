dojo.provide('toura.components.AudioPlayer');

dojo.require('mulberry.app.PhoneGap');
dojo.require('toura.components._MediaPlayer');
dojo.require('toura.components.buttons.PlaylistButton');

dojo.declare('toura.components.AudioPlayer', toura.components._MediaPlayer, {
  templateString : dojo.cache('toura.components', 'AudioPlayer/AudioPlayer.haml'),
  widgetsInTemplate: true,

  helpers : {
    playlistButton : dojo.cache('toura.components', 'AudioPlayer/_PlaylistButton.haml')
  },

  playerType : 'audio',
  isPlaying : false,
  playerSettings : {
    preload : 'auto',
    controls : true,
    autobuffer : true
  },
  showPlaylistButton : true,
  
  startup : function() {
    this.inherited(arguments);
    debugger;
    this.connect(this.playlistButton, 'onClick', this._playlistClick);
  },

  prepareData : function() {
    this.medias = this.node.audios || [];
    this.inherited(arguments);
  },

  setupConnections : function() {
    this.inherited(arguments);

    if (!this.useHtml5Player) {
      this.connect(this.controller, 'click', '_handleControllerClick');
    }
  },

  _handleControllerClick : function() {
    if (this.useHtml5Player) { return; }

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
  },
  
  _playlistClick : function() {
    // event stub
    console.log("audioplayer got the playlist click");
  }

});
