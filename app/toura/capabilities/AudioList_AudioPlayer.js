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
    [ 'audioPlayer', 'onPause', '_pausePlaying' ],
    [ 'audioPlayer', 'finishedPlaying', '_clearPlaying' ]
  ],

  _playAudio : function(audioId) {
    if (this.audioPlayer.isPlaying && this.audioPlayer.media && this.audioPlayer.media.id == audioId) {
      this.audioPlayer.pause();
    } else {
      this.audioPlayer.play(audioId);
    }
  },

  _highlightPlaying : function(audioId) {
    this.audioList.set('currentAsset', audioId);
    this.audioList.addClass('playing');
  },

  _pausePlaying : function() {
    this.audioList.removeClass('playing');
  },

  _clearPlaying : function() {
    this.audioList.set('currentAsset', '');
  }
});

