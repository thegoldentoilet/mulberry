dojo.provide('toura.components.ChildNodeGrid');

dojo.require('mulberry.ui.BackgroundImage');
dojo.require('toura.components._ChildNodeFeaturedImages');

dojo.declare('toura.components.ChildNodeGrid', toura.components._ChildNodeFeaturedImages, {
  templateString : dojo.cache('toura.components', 'ChildNodeGrid/ChildNodeGrid.haml'),
  tabletItemTemplate : dojo.cache('toura.components', 'ChildNodeGrid/ChildNodeGridItemTablet.haml'),
  phoneItemTemplate : dojo.cache('toura.components', 'ChildNodeGrid/ChildNodeGridItemPhone.haml'),

  postCreate : function() {
    this.itemTemplate = this.isTablet ? Haml(this.tabletItemTemplate) : Haml(this.phoneItemTemplate);

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
