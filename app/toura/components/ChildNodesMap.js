dojo.provide('toura.components.ChildNodesMap');

dojo.require('toura.components.ChildNodes');
dojo.require('toura.components.GoogleMap')

dojo.declare('toura.components.ChildNodesMap', [toura.components.ChildNodes, toura.components.GoogleMap], {
  templateString : dojo.cache('toura.components', 'ChildNodesMap/ChildNodesMap.haml'),
  handleClicks : false,
  
  prepareData : function() {
    this.node.populateChildren();

    // TODO: cleanup hackyness
    toura.components.ChildNodes.prototype.prepareData.apply(this, arguments);
    
    // this shouldn't be necessary, but there is some inheritance sloppiness
    // buried deep in the node model that makes it so
    this.node.googleMapPins = [];
    
    dojo.forEach(this.children, dojo.hitch(this, function(item) {
      if (item.googleMapPins.length === 0) return false;
      var pin = item.googleMapPins[0];
      pin.node = item;
      this.node.googleMapPins.push(pin);
    }));
    
    toura.components.GoogleMap.prototype.prepareData.apply(this, arguments);
  },
  
  _showInfo : function (/** google.maps.Marker */ marker, /** toura.models.GoogleMapPin */ pin) {
    mulberry.app.Router.go(pin.node.url);
  }
});
