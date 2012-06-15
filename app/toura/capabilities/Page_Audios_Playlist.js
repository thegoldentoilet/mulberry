dojo.provide('toura.capabilities.Page_Audios_Playlist');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.Page_Audios_Playlist', mulberry._Capability, {
  requirements : {
    audioPlayer : 'AudioPlayer',
    audioList : 'AudioList'
  },

  connects : [
    [ 'page', 'init', '_setup' ],
    [ 'audioPlayer', '_playlistClick', 'foo' ]
  ],
  
  _setup : function() {
    // debugger;
  },
  
  foo: function() {
    console.log("BAOOOEEAONU!");
  }
  
});
