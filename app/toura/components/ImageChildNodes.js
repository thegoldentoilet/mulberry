dojo.provide('toura.components.ImageChildNodes');

dojo.require('toura.components.ChildNodes');
dojo.require('mulberry.ui.BackgroundImage');

dojo.declare('toura.components.ImageChildNodes', toura.components.ChildNodes, {
  templateString : dojo.cache('toura.components', 'ImageChildNodes/ImageChildNodes.haml'),
  widgetsInTemplate : true,

  prepareData : function() {
    this.node.populateChildren();
    this.children = dojo.filter(this.node.children || [], function(child) {
      return child.featuredImage !== undefined;
    });
  }
});
