dojo.provide('toura.components.PlaylistButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.PlaylistButton', toura.components.buttons._Button, {
  templateString : dojo.cache('toura.components', 'PlaylistButton/PlaylistButton.haml'),

  initializeStrings : function() {
    this.i18n_text = this.getString('PLAYLIST');
  },

  onClick : function(e) {
    e.preventDefault();
  }
});