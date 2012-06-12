dojo.provide('toura.components.buttons.PlaylistButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.buttons.PlaylistButton', toura.components.buttons._Button, {
  "class" : "playlistToggle",

  onClick : function(e) {
    e.preventDefault();
  }
});