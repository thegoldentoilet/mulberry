dojo.provide('toura.components.buttons.LayoutToggleButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.buttons.LayoutToggleButton', toura.components.buttons._Button, {
  initializeStrings : function() {
    // Uhhh... this is a bit challenging
    this.i18n_text = "";
  },
  
  addParentClass : function(className) {
    dojo.addClass(this.domNode.parentElement, className);
  },
  
  removeParentClass : function(className) {
    dojo.removeClass(this.domNode.parentElement, className);
    if (className === undefined) {
      this.addParentClass('toggleButton');
    }
  }
});
