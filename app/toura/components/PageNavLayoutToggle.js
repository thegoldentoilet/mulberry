dojo.provide('toura.components.PageNavLayoutToggle');

dojo.require('toura.components.PageNav');

dojo.declare('toura.components.PageNavLayoutToggle', toura.components.PageNav, {
  prepareData : function() {
    this.inherited(arguments);
    
    this.layoutToggle = true;
  },
  
  setupConnections : function() {
    this.inherited(arguments);
    
    if (this.layoutToggle) {
      this.connect(this.layoutToggleButton, 'onClick', 'toggleLayout');
    }
  },
  
  toggleLayout : function() {
    // stub for component
  },
  
  _setToggleClassAttr : function(className) {
    // debugger;
    this.layoutToggleButton.removeParentClass();
    this.layoutToggleButton.addParentClass(className);
  }
}); 