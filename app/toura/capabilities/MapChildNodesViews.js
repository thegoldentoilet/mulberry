dojo.provide('toura.capabilities.MapChildNodesViews');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.MapChildNodesViews', mulberry._Capability, {
  requirements : {
    mapPageNav : 'map:PageNavLayoutToggle',
    listPageNav : 'list:PageNavLayoutToggle'
  },

  connects : [
    ['page', 'init', '_showMap'],
    ['mapPageNav', 'toggleLayout', '_showList'],
    ['listPageNav', 'toggleLayout', '_showMap']
  ],
  
  _showList : function() {
    this.page.showScreen('list');
  },
  
  _showMap : function() {
    this.page.showScreen('map');
  }
});