dojo.provide('toura.components.ChildNodes');

dojo.require('mulberry._Component');

dojo.declare('toura.components.ChildNodes', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'ChildNodes/ChildNodes.haml'),
  handleClicks : true,

  prepareData : function() {
    this.children = [];
    dojo.when(this.node.children.query(), dojo.hitch(this, function(data) {
      this.children = data;

      // only run adjustMarkup again if the domNode has been generated
      if(this.domNode) {
        this.adjustMarkup();
      }
    }));
  },

  adjustMarkup : function() {
    if (!this.children.length) {
      this.addClass('empty');
    } else {
      this.removeClass('empty');
    }
  },

  _clickHandler : function(t, e) {
    dojo.addClass(t, 'tapped');
  }
});
