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
    ['pageNav', 'layoutToggle', '_toggle']
  ],
  
  _toggle : function() {
    debugger;
  },
  
  _showList : function() {
    this.page.showScreen('list');
  },
  
  _showMap : function() {
    this.page.showScreen('map');
  }
});