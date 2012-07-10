dojo.provide('toura.components.AudioPlayer');

dojo.require('mulberry.app.PhoneGap');
dojo.require('toura.components._MediaPlayer');

dojo.declare('toura.components.AudioPlayer', toura.components._MediaPlayer, {
  templateString : dojo.cache('toura.components', 'AudioPlayer/AudioPlayer.haml'),

  playerType : 'audio',
  isPlaying : false,
  playerSettings : {
    preload : 'auto',
    controls : false,
    autobuffer : true
  },

  prepareData : function() {
    this.medias = this.node.audios || [];
    this.inherited(arguments);

    window.audioPlayer = this;
  },

  startup : function() {
    this.inherited(arguments);
    this._setupSpinner();
  },

  setupConnections : function() {
    this.inherited(arguments);

    this.connect(this.playpause, 'click', '_handleControllerClick');
    if(this.useHtml5Player) {
      this.connect(this.rev30, 'click', '_reverse30seconds');
    }
  },

  _getSpinnerStyles : function() {
    var s, styles;

    dojo.style(this.spinner, 'background-color', '');
    s = getComputedStyle(this.spinner);
    styles = {
      color: s.color,
      backgroundColor: s.backgroundColor
    };
    dojo.style(this.spinner, 'background-color', 'transparent');

    return styles;
  },

  _setupSpinner : function() {
    var canvas = document.createElement("canvas"),
        marginBox = this.spinner.marginBox = dojo.marginBox(this.spinner),
        ctx = this.spinner.ctx = canvas.getContext("2d");

    // 3.2 : 2 (for radius) and 1.6 (to get 62.5% of height altogether)
    this.spinner.radius = Math.min(marginBox.h, marginBox.w) / 3.2;
    this.spinner.center = {
      x: marginBox.w / 2,
      y: marginBox.h / 2
    };

    canvas.height = marginBox.h;
    canvas.width = marginBox.w;

    this.spinner.appendChild(canvas);

    this._updateSpinner();
  },

  // _updateSpinner resets the spinner first
  _updateSpinner: function() {
    if (!this.spinner) { return; }

    var ctx = this.spinner.ctx,
        styles = this._getSpinnerStyles();

    ctx.strokeStyle = styles.color;
    ctx.lineWidth = 2;
    ctx.clearRect(0, 0, this.spinner.marginBox.w, this.spinner.marginBox.h);
    ctx.fillStyle = styles.backgroundColor;

    ctx.beginPath();
    ctx.arc(this.spinner.center.x, this.spinner.center.y, this.spinner.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    if (this.isPlaying) {
      ctx.stroke();
    }

    this._setSpinnerPercent(this.getCurrentPercent(), styles);
  },

  _setSpinnerPercent: function(percent /* 0 to 100 */, styles) {
    if (!this.spinner) { return; }

    var pct = percent/100,
        radPct = Math.PI * (2 * pct - 0.5)   ,
        ctx = this.spinner.ctx;

    ctx.fillStyle = 'color' in styles ? styles.color : "#ffffff";
    ctx.beginPath();
    ctx.arc(this.spinner.center.x, this.spinner.center.y, this.spinner.radius, Math.PI * -0.5, radPct);
    ctx.lineTo(this.spinner.center.x, this.spinner.center.y);
    ctx.closePath();
    ctx.fill();
  },

  _handleControllerClick : function() {
    if (this.isPlaying) {
      this._pause();
    } else {
      this._play();
    }
  },

  _reverse30seconds : function() {
    if (!this.media) { return; }
    this.seekRelativeTime(-30);
    this._updateSpinner();
  },

  _play : function(media) {
    this.inherited(arguments);

    this.set('isPlaying', true);
    this.addClass('playing');

    if (this.useHtml5Player) { return; }

    var pg = mulberry.app.PhoneGap;
    pg.audio.destroy();
    pg.audio.play(this.media.url);

    this._updateSpinner();
  },

  _pause : function() {
    this.inherited(arguments);

    this.set('isPlaying', false);
    this.removeClass('playing');

    if (this.useHtml5Player) { return; }

    mulberry.app.PhoneGap.audio.stop();
  },

  _startSpinner : function() {
    this.spinnerInterval = setInterval(dojo.hitch(this, function() {
      this._updateSpinner();
    }), 1000);
  },

  _stopSpinner : function() {
    clearInterval(this.spinnerInterval);
  },

  _setIsPlayingAttr : function(val /* Boolean */) {
    var spinnerMethod = val ? '_startSpinner' : '_stopSpinner';
    this.isPlaying = val;

    if(this.spinner) {
      this._updateSpinner();
      this[spinnerMethod]();
    }
  },

  teardown : function() {
    if (!this.useHtml5Player) {
      // we used the phonegap player
      mulberry.app.PhoneGap.audio.destroy();
    }
  }

});
