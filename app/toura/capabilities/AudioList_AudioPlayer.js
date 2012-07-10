dojo.provide('toura.capabilities.AudioList_AudioPlayer');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.AudioList_AudioPlayer', mulberry._Capability, {
  requirements : {
    audioList : 'AudioList',
    audioPlayer : 'AudioPlayer'
  },

  connects : [
    [ 'audioList', 'onSelect', '_playAudio' ],
    [ 'audioPlayer', 'onPlay', '_highlightPlaying' ],
    [ 'audioPlayer', 'onPause', '_clearPlaying' ],
    [ 'audioPlayer', 'finishedPlaying', '_clearPlaying' ]
  ],

  _playAudio : function(audioId) {
    this.audioPlayer.play(audioId);
  },

  _highlightPlaying : function(audioId) {
    this.audioList.set('currentAsset', audioId);
  },

  _clearPlaying : function() {
    this.audioList.set('currentAsset', '');
  }
});

