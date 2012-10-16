dojo.provide('toura.components.ChildNodes');

dojo.require('mulberry.components._LinkedList');

dojo.declare('toura.components.ChildNodes', mulberry.components._LinkedList, {
  templateString : dojo.cache('toura.components', 'ChildNodes/ChildNodes.haml'),
  itemTemplate : Haml(dojo.cache('toura.components', 'ChildNodes/ChildNodeItem.haml')),
  handleClicks : true,

  postCreate : function() {
    this.inherited(arguments);

    dojo.when(this.node.children.query(), dojo.hitch(this, function(data) {
      this.setStore(data);
    }));
  },

  _clickHandler : function(t, e) {
    dojo.addClass(t, 'tapped');
  }
});
