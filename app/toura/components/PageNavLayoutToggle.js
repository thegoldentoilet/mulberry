dojo.provide('toura.components.PageNavLayoutToggle');

dojo.require('toura.components.PageNav');

dojo.declare('toura.components.PageNavLayoutToggle', toura.components.PageNav, {
  prepareData : function() {
    this.inherited(arguments);
    
    this.layoutToggle = true;
  },
  
  setupConnections : function() {
    if (this.layoutToggle) {
      this.connect(this.layoutToggleButton, 'onClick', 'toggleLayout');
    }
  },
  
  toggleLayout : function() {
    // stub for component
  }
}); 