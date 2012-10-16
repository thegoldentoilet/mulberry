dojo.provide('toura.components._ChildNodeFeaturedImages');

dojo.require('mulberry.ui.BackgroundImage');
dojo.require('toura.models.FeaturedImage');
dojo.require('toura.components.ChildNodes');

dojo.declare('toura.components._ChildNodeFeaturedImages', toura.components.ChildNodes, {
  widgetsInTemplate : true,

  postCreate : function() {
    this.inherited(arguments);

    // TODO: MAP should enforce this restraint
    this.setStore(this.node.children.query(function(child) {
      return child.featuredImage !== undefined;
    }));
  },

  _addItem : function(item, index) {
    var featuredImage;

    // if the featuredImage provided isn't an array, it has already been processed
    if (dojo.isArray(item.featuredImage)) {
      featuredImage = new toura.models.FeaturedImage(this.node.store, item.featuredImage[0]);
      item.featuredImage = featuredImage;
    }

    this.inherited(arguments);
  }
});
