dojo.provide('toura.capabilities.AudioList_AudioTitle');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.AudioList_AudioTitle', mulberry._Capability, {
  requirements : {
    audioList : 'AudioList',
    audioTitle : 'AudioTitle'
  },

  connects : [
    [ 'audioList', 'onSelect', '_setTitle' ]
  ],

  _setTitle : function(audioId) {
    var audio = this.baseObj.getAssetById('audio', audioId);
    if (!audio) { return; }
    this.audioTitle.set('content', audio.name || '');
  }
});
