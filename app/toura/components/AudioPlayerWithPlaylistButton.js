dojo.provide('toura.components.AudioPlayerWithPlaylistButton');

dojo.require('toura.components.AudioPlayer');

dojo.define('toura.components.AudioPlayerWithPlaylistButton', toura.components.AudioPlayer, {
  templateString : dojo.cache('toura.components', 'AudioPlayerWithPlaylistButton/AudioPlayerWithPlaylistButton.haml'),

  helpers : {
    playlistButton : dojo.cache('toura.components', 'AudioPlayerWithPlaylistButton/_PlaylistButton.haml')
  },

  widgetsInTemplate : true,

  terminal: null      // comma stopper
});