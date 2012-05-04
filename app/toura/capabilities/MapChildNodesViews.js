dojo.provide('toura.capabilities.MapChildNodesViews');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.MapChildNodesViews', mulberry._Capability, {
  mapInit: null,
  
  init : function() {
    mapInit = false;
  },
  
  requirements : {
    map : 'ChildNodesMap',
    mapPageNav : 'map:PageNavLayoutToggle',
    listPageNav : 'list:PageNavLayoutToggle'
  },

  connects : [
    ['page', 'init', '_showList'],
    ['mapPageNav', 'toggleLayout', '_showList'],
    ['listPageNav', 'toggleLayout', '_showMap']
  ],
  
  _showList : function() {
    this.page.showScreen('list');
  },
  
  _showMap : function() {
    this.page.showScreen('map');
    if (mapInit === false) {
      mapInit = true;
      // still doesn't quiiiiite work.
      setTimeout(dojo.hitch(this.map, this.map.positionInit), 50);
    }
  }
});