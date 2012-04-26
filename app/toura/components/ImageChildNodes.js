dojo.provide('toura.components.ImageChildNodes');

dojo.require('mulberry._Component');
dojo.require('mulberry.ui.BackgroundImage');

dojo.declare('toura.components.ImageChildNodes', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'ImageChildNodes/ImageChildNodes.haml'),
  widgetsInTemplate : true,
  handleClicks : true,

  prepareData : function() {
    this.node.populateChildren();
    this.children = dojo.filter(this.node.children || [], function(child) {
      return child.featuredImage !== undefined;
    });
  },

  adjustMarkup : function() {
    if (!this.children.length) {
      this.addClass('empty');
    }
  },

  _clickHandler : function(t, e) {
    dojo.addClass(t, 'tapped');
  }
});
