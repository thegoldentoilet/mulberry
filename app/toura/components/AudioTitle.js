dojo.provide('toura.components.AudioTitle');

dojo.require('toura.components.BodyText');

dojo.declare('toura.components.AudioTitle', toura.components.BodyText, {
  "class" : 'audio-title',

  _getBodyText : function() {
    if (!this.node || !this.node.audios) { return ''; }
    return this.node.audios[0] ? (this.node.audios[0].name || '') : '';
  }
});
