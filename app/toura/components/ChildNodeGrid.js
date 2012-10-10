dojo.provide('toura.components.ChildNodeGrid');

dojo.require('mulberry.ui.BackgroundImage');
dojo.require('toura.models.FeaturedImage');
dojo.require('toura.components.ChildNodes');

dojo.declare('toura.components.ChildNodeGrid', toura.components.ChildNodes, {
  templateString : dojo.cache('toura.components', 'ChildNodeGrid/ChildNodeGrid.haml'),
  widgetsInTemplate : true,

  postCreate : function() {
    var templateName = this.isTablet ? 'ChildNodeGridItemTablet.haml' : 'ChildNodeGridItemPhone.haml';
    this.itemTemplate = Haml(dojo.cache('toura.components', 'ChildNodeGrid/' + templateName));

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
  },

  _checkLength : function() {
    this.inherited(arguments);

    if (this.isTablet) {
      var num = this.storeData.length,
          size = num > 11 ? 'medium' : 'large';

      this.removeClass(['size-medium', 'size-large']);
      this.addClass('size-' + size);
    }

    if (this.device.os === 'ios') { return ; }

    var addedCSS = dojo.byId('component-css-child-node-grid');

    dojo.destroy(addedCSS);

    var tpl = dojo.cache('toura.components.ChildNodeGrid', 'child-node-grid.css.tpl'),
        aspectRatio = 3/4,
        width = Math.floor(mulberry.app.UI.viewport.width / 2 - 18),
        height = Math.floor(width * aspectRatio * 1.40),
        imageHeight = width * aspectRatio,
        css = dojo.string.substitute(tpl, {
          width : width,
          height : height,
          imageHeight : imageHeight
        });

    dojo.place(css, document.querySelector('head'));
  }
});
