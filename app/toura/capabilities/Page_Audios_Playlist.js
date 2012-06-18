dojo.provide('toura.capabilities.Page_Audios_Playlist');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.Page_Audios_Playlist', mulberry._Capability, {
  requirements : {
    playlistButton : 'PlaylistButton',
    audioList : 'AudioList'
  },

  connects : [
    [ 'page', 'init', '_setup' ],
    [ 'playlistButton', 'onClick', 'togglePlaylist' ]
  ],
  
  init : function() {
    this.playlistVisible = false;
    this.audioList.region.hide();
  },

  _setup : function() {
    // debugger;
  },
  
  togglePlaylist : function() {
    if (this.playlistVisible) {
      this._hidePlaylist.call(this);
    } else {
      this._showPlaylist.call(this);
    }
  },

  _showPlaylist : function() {
    this.playlistVisible = true;
    this.playlistButton.addClass('playlist-visible');
    this.audioList.region.show();
  },

  _hidePlaylist : function() {
    this.playlistVisible = false;
    this.playlistButton.removeClass('playlist-visible');
    this.audioList.region.hide();
  },

  commaStopper : undefined
  
});
