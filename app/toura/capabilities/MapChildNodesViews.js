dojo.provide('toura.capabilities.MapChildNodesViews');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.MapChildNodesViews', mulberry._Capability, {
  requirements : {
    childNodesMap : 'ChildNodesMap',
    childNodesList : 'ChildNodes',
    pageNav : 'PageNavLayoutToggle'
  },

  connects : [
    ['page', 'init', '_showList'],
    ['pageNav', 'toggleLayout', '_toggle']
  ],
  
  _toggle : function() {
    console.log("HOLY CARP YOU CAN DO YOUR TOGGLE NOW OMG OMG OMG IT WORKED!");
    debugger;
  },
  
  _showList : function() {
    console.log("listerine!");
    this.page.showScreen('list');
  },
  
  _showMap : function() {
    console.log("mapportunity!");
    this.page.showScreen('map');
  }
});