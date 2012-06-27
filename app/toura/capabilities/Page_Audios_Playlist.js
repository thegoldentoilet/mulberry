dojo.provide('toura.capabilities.Page_Audios_Playlist');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.Page_Audios_Playlist', mulberry._Capability, {
  requirements : {
    playlistButton : 'PlaylistButton',
    audioList : 'AudioList'
  },

  connects : [
    [ 'page', 'startup', '_setup' ],
    [ 'playlistButton', 'onClick', 'togglePlaylist' ]
  ],
  
  coverDiv : null,

  init : function() {
    this.playlistVisible = false;
    this.audioList.region.hide();
  },

  _setup : function() {
    // this is not ideal, since it sort of breaks the idea of components. But it
    // will work until we get a proper solution for modal windows.
    var contentRegion = dojo.query('.page-content')[0], audioCount = this.page.baseObj;
    this.coverDiv = document.createElement('div');

    dojo.addClass(this.coverDiv, ['cover', 'hidden']);
    dojo.connect(this.coverDiv, 'click', this, function(e) {
      e.preventDefault();
      e.stopPropagation();
      this._hidePlaylist();
    });

    contentRegion.appendChild(this.coverDiv);

    debugger;
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
    dojo.removeClass(this.coverDiv, 'hidden');
  },

  _hidePlaylist : function() {
    this.playlistVisible = false;
    this.playlistButton.removeClass('playlist-visible');
    this.audioList.region.hide();
    dojo.addClass(this.coverDiv, 'hidden');
  }
  
});
