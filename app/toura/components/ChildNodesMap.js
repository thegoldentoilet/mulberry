dojo.provide('toura.components.ChildNodesMap');

dojo.require('toura.components.ChildNodes');
dojo.require('toura.components.GoogleMap');
dojo.require('toura.URL');
dojo.require('toura.models.GoogleMapPin');

dojo.declare('toura.components.ChildNodesMap', [toura.components.GoogleMap, toura.components.ChildNodes], {
  templateString : dojo.cache('toura.components', 'ChildNodesMap/ChildNodesMap.haml'),
  handleClicks : false,
  
  postCreate : function() {
    // this.inherited(arguments);
    toura.components.GoogleMap.prototype.postCreate.apply(this, arguments);

    dojo.when(this.node.children.query(function(child) {
      return child.googleMapPins !== undefined && child.googleMapPins.length > 0;
    }), dojo.hitch(this, function(data) {
      this.setStore(data);
    }));
  },

  prepareData : function() {
    toura.components.ChildNodes.prototype.prepareData.apply(this, arguments);

    this.pins = [];

    this.node.googleMapPins = [];

    toura.components.GoogleMap.prototype.prepareData.apply(this, arguments);
  },

  clearItems : function() {
    if (!this.isBuilt) { return false; }
    if (window.google && window.google.maps && window.google.maps.event) {
      dojo.forEach(this.markers, function (marker) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      });
    }
    this.pins = [];
  },

  _addItem : function(item, index) {
    var pin = new toura.models.GoogleMapPin(this.node.store, item.googleMapPins[0]);
    pin.node = item;
    if(this.isBuilt) {
      console.log("adding pin", pin);
      this.addPin(pin);
    }

    this.pins.splice(index, 0, pin);
  },

  _dropItem : function(index) {
    var pin = this.pins[index];
    if(this.isBuilt) {
      this.dropPin(pin);
    }

    this.pins.splice(index, 1);
  },
  
  _showInfo : function (/** google.maps.Marker */ marker, /** toura.models.GoogleMapPin */ pin) {
    mulberry.app.Router.go(toura.URL.node(pin.node.id));
  }
});
