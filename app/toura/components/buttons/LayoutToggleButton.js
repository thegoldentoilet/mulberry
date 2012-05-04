dojo.provide('toura.components.buttons.LayoutToggleButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.buttons.LayoutToggleButton', toura.components.buttons._Button, {
  initializeStrings : function() {
    this.i18n_text = "toggle"
  }
});
