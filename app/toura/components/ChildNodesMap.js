dojo.provide('toura.components.ChildNodesMap');

dojo.require('toura.components.ChildNodes');
dojo.require('toura.components.GoogleMap')

dojo.declare('toura.components.ChildNodesMap', [toura.components.ChildNodes, toura.components.GoogleMap], {
  templateString : dojo.cache('toura.components', 'ChildNodesMap/ChildNodesMap.haml'),
  handleClicks : true,
  
  prepareData : function() {
    // TODO: cleanup hackyness
    toura.components.ChildNodes.prototype.prepareData.apply(this, arguments);
    
    dojo.forEach(this.children, dojo.hitch(this, function(item) {
      var pin = new toura.models.GoogleMapPin(
        item._S,
        (item.googleMapPins[0])
      );
      pin.node = item;
      this.node.googleMapPins.push(pin);
    }));
    
    toura.components.GoogleMap.prototype.prepareData.apply(this, arguments);
  },
  
  _showInfo : function (/** google.maps.Marker */ marker, /** toura.models.GoogleMapPin */ pin) {
    window.location.hash = '#/node/node-' + pin.node.node_name[0];
  }
});
