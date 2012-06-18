dojo.provide('toura.components.PlaylistButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.PlaylistButton', toura.components.buttons._Button, {
  templateString : dojo.cache('toura.components', 'PlaylistButton/PlaylistButton.haml'),

  onClick : function(e) {
    e.preventDefault();
  }
});