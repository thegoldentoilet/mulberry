dojo.provide('toura.components.PlaylistButton');

dojo.require('mulberry._Component');

dojo.declare('toura.components.PlaylistButton', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'PlaylistButton/PlaylistButton.haml'),

  onClick : function(e) {
    e.preventDefault();
  }
});