dojo.provide('mulberry.app.UI');

dojo.require('mulberry.Device');
dojo.require('mulberry.Utilities');
dojo.require('mulberry.app.Config');
dojo.require('mulberry.containers.Viewport');
dojo.require('mulberry.app.PhoneGap');
dojo.require('dojo.string');

dojo.require('dojo.Stateful');

dojo.declare('mulberry.app.UI', dojo.Stateful, {
  containers : {},
  currentPage : null,

  constructor : function(device) {
    this.device = device;
    this.body = dojo.body();
    this.hasTouch = 'ontouchstart' in window;
    this.touchMoveDebounce = device.os === 'android' ? 200 : 0;
    
    if (mulberry.Device.os === 'browser') {
      
      if (mulberry.Device.browserOS === 'android') {
        mulberry.Device.heightHash = {};
        dojo.connect(window, "resize", this, '_fixHeight');
      } else if (mulberry.Device.browserOS === 'ios') {
        dojo.connect(window, 'onorientationchange', this, '_fixHeight');
      }
      this._fixHeight();
    }

    this._containersSetup();

    this._watchers();
    this._updateViewport();

    this._uiSetup();
    this._eventSetup();
  },

  addPersistentComponent : function(klass, opts, position) {
    var c = new klass(opts);
    c.placeAt(this.body, position);
    return c;
  },

  _watchers : function() {
    var watchers = {
      fontSize : function(k, oldSize, newSize) {
        var b = this.body;
        if (oldSize) { dojo.removeClass(b, oldSize); }
        dojo.addClass(b, newSize);
        mulberry.app.DeviceStorage.set('fontSize', newSize);
        dojo.publish('/fontsize');
      },

      navDirection : function(k, old, dir) {
        this.containers.viewport.set('navDirection', dir);
      }
    };

    dojo.forIn(watchers, this.watch, this);
  },

  _updateViewport : function() {
    this.viewport = {
      width : this.body.offsetWidth,
      height : this.body.offsetHeight
    };
  },

  _uiSetup : function() {
    var b = this.body,
        device = this.device,
        feature;

    dojo.addClass(b, device.type);
    dojo.addClass(b, device.os);
    if (device.os === "browser") {
      dojo.addClass(b, device.browserOS);
    }
    dojo.addClass(b, 'version-' + mulberry.app.PhoneGap.device.version);

    this.set('fontSize', mulberry.app.DeviceStorage.get('fontSize'));

    if (mulberry.isMAP) {
      dojo.addClass(b, 'layout-MAP');
    }

    //>>excludeStart('production', kwArgs.production);
    if (mulberry.features && mulberry.features.debugToolbar) { mulberry.app._Debug(b); }
    //>>excludeEnd('production');
  },

  _containersSetup : function() {
    this.containers.viewport = new mulberry.containers.Viewport().placeAt(this.body, 'first');
  },

  _eventSetup : function() {
    dojo.connect(document, 'touchmove', function(e) {
      e.preventDefault();
    });

    dojo.connect(window, 'resize', this, function() {
      this._updateViewport();
      dojo.publish('/window/resize');
    });

    dojo.connect(document, 'menubutton', this, function(e) {
      e.preventDefault();
      dojo.publish('/button/menu');
    });

    dojo.connect(document, 'backbutton', this, function(e) {
      e.preventDefault();
      mulberry.app.Router.back();
    });

    dojo.connect(document, 'searchbutton', this, function(e) {
      mulberry.app.Router.go('/search');
      e.preventDefault();
    });
  },

  showPage : function(page, node) {
    if (!page) {
      throw new Error('mulberry.app.UI::showPage called without a page to show');
    }

    if (page.startup) {
      var s = dojo.subscribe('/page/transition/end', function() {
        page.startup();
        dojo.unsubscribe(s);
      });
    }

    this.containers.viewport.set('content', page);
    this.currentPage = page;
  },

  hideSplash : function() {
    var splash = dojo.byId('splash');
    if (splash) { dojo.destroy(splash); }
  },
  
  // this is for mobile web *only*
  _fixHeight : function() {
    if (mulberry.Device.type !== 'phone') { return; }
    
    if (mulberry.Device.browserOS === 'ios') {
      return this._iosFixHeight();
    }
    
    if (mulberry.Device.browserOS === 'android') {
      if(mulberry.Device.heightHash[window.orientation] ) {
        return this._androidFixHeight(mulberry.Device.heightHash[window.orientation]);
      } else {
        setTimeout(dojo.hitch(this, function() {
          return this._androidFixHeight();
        }), 250);
      }
    }
  },
  
  _iosFixHeight : function() {
    var screenHigh = 0;
    this._setBodyHeight(9999);    // larger than any reasonable screen
    window.scrollTo(0,0);
    
    // this is a terrible, terrible hack
    // but it is impossible to get a correct number in iOS < 5
    // for portrait (landscape works fine, go figure)
    var oldVersionPortraitCheck = window.innerHeight === 356 && mulberry.Device.browserVersion < 5;
    
    screenHigh = oldVersionPortraitCheck ? 416 : window.innerHeight;
    this._setBodyHeight(screenHigh);
    
    if (oldVersionPortraitCheck) {
      setTimeout(function() {
        window.scrollTo(0,0);
      },0);
    }
  },
  //this is for mobile web only on android browser
  _androidFixHeight : function(pixels) {   
    if(!pixels) {
      var pixels = pixels ? pixels : (window.outerHeight-54) + "px";
      mulberry.Device.heightHash[window.orientation] = pixels;
    }

    dojo.style(document.body, 'height', pixels);
  },
  
  _setBodyHeight : function(pixels) {
    if (typeof pixels === "number") { pixels += "px"; }
    dojo.style(document.body, 'height', pixels);
  }
});

dojo.subscribe('/app/ready', function() {
  mulberry.app.UI = new mulberry.app.UI(mulberry.Device);
  dojo.publish('/ui/ready');
  mulberry.showPage = dojo.hitch(mulberry.app.UI, 'showPage');
});
