dojo.provide('toura.capabilities._MapChildNodesViews');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities._MapChildNodesViews', mulberry._Capability, {
  mapInit: null,

  init : function() {
    mapInit = false;
    this.mapPageNav.set('toggleClass', 'list');
    this.listPageNav.set('toggleClass', 'map');
  },

  requirements : {
    map : 'ChildNodesMap',
    mapPageNav : 'map:PageNavLayoutToggle',
    listPageNav : 'list:PageNavLayoutToggle'
  },

  connects : [
    ['mapPageNav', 'toggleLayout', '_showList'],
    ['listPageNav', 'toggleLayout', '_showMap']
  ],

  _showList : function() {
    this.page.showScreen('list');
    dojo.publish('/content/update');
  },

  _showMap : function() {
    this.page.showScreen('map');
    if (mapInit === false) {
      mapInit = true;
    }
  }
});
