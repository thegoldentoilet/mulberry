dojo.provide('toura.components.GoogleMap');

dojo.require('mulberry._Component');
dojo.require('mulberry.app.PhoneGap');
dojo.require('dojo.io.script');
dojo.require('toura.URL');

(function (dojo) {
  var callbackUuid = 0;

  // Google Maps API v3 reference:
  // https://code.google.com/apis/maps/documentation/javascript/reference.html

  dojo.declare('toura.components.GoogleMap', mulberry._Component, {
    templateString : dojo.cache('toura.components', 'GoogleMap/GoogleMap.haml'),

    mapType : 'roadmap',
    apiURL : mulberry.app.URL.protocol() + '://maps.google.com/maps/api/js?v=3.4&sensor=false&callback=',
    center: null,

    prepareData : function() {
      // TODO: different behavior if the network isn't reachable?
      this.queue = [];
      this.googleTries = 0;
      this.pinCache = {};
      this.markerCache = {};
      this.googleReady = false;
      this.isBuilt = false;
      this.isVisible = true;
      this.openInfoWindow = undefined;

      this.pins = this.node.googleMapPins;

      dojo.forEach(this.pins, function(pin) {
        this.pinCache[pin.id] = pin;
      }, this);
    },
    
    setupConnections : function() {
      this.inherited(arguments);
      
      this.connect(this.page, 'showScreen', '_screenCheck');
    },

    // this intentionally still uses postcreate rather than a _Component
    // lifecycle method
    postCreate : function () {
      this.inherited(arguments);

      // The script that gets loaded here injects its own additional
      // scripts to the page, so we need to use a slightly custom callback mechanism
      this.callbackName = 'GoogleMapCallback' + (++callbackUuid);
      window[this.callbackName] = dojo.hitch(this, '_buildCheck');
      dojo.io.script.get({ url: this.apiURL + this.callbackName });
    },

    addPin : function(pin) {
      var position = new google.maps.LatLng(pin.lat, pin.lon),
          marker = new google.maps.Marker({
            map : this.map,
            position : position,
            title : pin.name
          });

      google.maps.event.addListener(
        marker,
        'click',
        dojo.hitch(this, '_showInfo', marker, pin)
      );

      this.bounds.extend(position);

      this.markerCache[pin.id] = marker;

      if (this.isBuilt) {
        this.positionInit();
      }

      return marker;
    },

    dropPin : function(pin) {
      var marker = this.markerCache[pin.id];

      marker.setMap(null);

      google.maps.event.clearInstanceListeners(marker);

      delete this.markerCache[pin.id];
    },
    
    // this function makes sure we wait to set up the map
    // until its parent screen is visible--otherwise the
    // dimensions of the map will be fubared.
    _screenCheck : function() {
      this.isVisible = !this.screen.isHidden;
      if( this.isVisible && this.googleReady) {
        this._buildCheck();
      }
    },
    
    _buildCheck : function () {
      this.googleReady = true;
      if (this.isVisible && !this.isBuilt) {
        this._buildMap();
      }
    },

    _buildMap : function () {
      delete window[this.callbackName];

      this.map = new google.maps.Map(this.mapNode, {
        mapTypeId: this.mapType,
        streetViewControl : false,
        mapTypeControl : false,
        zoom : 0,
        zoomControl : true,
        zoomControlOptions : {
          position: google.maps.ControlPosition.TOP_RIGHT
        }
      });

      var bounds = this.bounds = new google.maps.LatLngBounds();

      this.markers = dojo.map(this.pins || [], this.addPin, this);
      
      this.positionInit();
      
      google.maps.event.addListener(this.map, 'dragend', dojo.hitch(this, function() {
        this.center = this.map.getCenter() || this.map.getBounds().getCenter();
      }));

      this.isBuilt = true;
      this._doQueue();

      dojo.subscribe('/window/resize', dojo.hitch(this, function() {
        // this timeout is necessary because google maps doesn't seem
        // to catch on to the resize event immediately. using a timeout
        // of 0 ms just ensures it gets tacked on the end of the execution
        // stack instead of running immediately
        setTimeout(dojo.hitch(this, this._recenter), 0);
      }));

      this.onMapBuilt();
    },
    
    positionInit : function() {
      if (this.pins.length > 1) {
        this.map.fitBounds(this.bounds);
        this.center = this.bounds.getCenter();
      } else {
        if (this.pins[0]) {
          this.center = new google.maps.LatLng(this.pins[0].lat, this.pins[0].lon);
          this.map.setCenter(this.center);
          this.map.setZoom(15);
        }
      }
    },

    _showInfo : function (/** google.maps.Marker */ marker, /** toura.models.GoogleMapPin */ pin) {
      var infoWindow;

      if (this.isTablet) {
        infoWindow = new google.maps.InfoWindow({
          content : this.pinInfo.domNode
        });

        if (this.openInfoWindow) {
          this.openInfoWindow.close();
        }
        this.openInfoWindow = infoWindow;
        infoWindow.open(this.map, marker);
      }

      this.onShowInfo(pin);
    },

    onShowInfo : function(pin) {
      // stub
    },

    onMapBuilt : function() {
      // stub
    },

    _setCenterAttr : function(center) {
      this.center = new google.maps.LatLng(center.lat, center.lng);
      this.map.setCenter(this.center);
      this.map.setZoom(15);
    },

    _recenter: function() {
      this.map.setCenter(this.center);
    },

    _setPinAttr : function(pinId) {
      if (!pinId) { return; }

      if (!this.isBuilt) {
        // stage stuff to run once map is built
        this._addToQueue(dojo.hitch(this, 'set', 'pin', pinId));
        return;
      }

      var marker = this.markerCache[pinId],
          pin = this.pinCache[pinId],
          newCenter = new google.maps.LatLng(pin.lat, pin.lon);

      this.map.panTo(newCenter);
      this._showInfo(marker, pin);
      this.pin = pin;
    },

    teardown : function () {
      if (!this.isBuilt) { return false; }
      if (window.google && window.google.maps && window.google.maps.event) {
        dojo.forEach(this.markers, function (marker) {
          google.maps.event.clearInstanceListeners(marker);
          marker.setMap(null);
        });

        google.maps.event.clearInstanceListeners(this.map);
      }
    },

    _addToQueue : function(fn) {
      this.queue.push(fn);
    },

    _doQueue : function() {
      while (this.queue.length) {
        this.queue.shift().call(this);
      }
    }
  });
}(dojo));
