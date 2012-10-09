dojo.provide('mulberry.components._LinkedList');

dojo.require('mulberry._Component');

dojo.declare('mulberry.components._LinkedList', mulberry._Component, {
  /**
   * LinkedList is a type of component that maintains a list of items
   * stored within an observable dojo store. The LinkedList keeps its
   * list up to date with the store.
   */

  /**
   * the template to use for each item
   */
  itemTemplate : null,


  /**
   * the domNode which contains the list
   *
   * by default, this is the main node, but could be a child node.
   */
  container: null,

  postCreate : function() {
    this.inherited(arguments);
    this.setupContainer();
  },

  /**
   * @public
   *
   * extend setupContainer to make a different node the container node
   */
  setupContainer : function() {
    this.container = this.domNode;
  },

  /**
   * @public
   *
   * sets the component to follow a particular store, and repopulates
   * it based on that store
   *
   * @param selection {StoreResult} the query result to display. the query must
   *                                be from an observable store
   */
  setStore : function(selection) {
    this.clearItems();

    this.storeData = selection;

    this.storeData.forEach(dojo.hitch(this, '_addItem'));

    if (this.observation) {
      this.observation.cancel();
    }

    this.observation = this.storeData.observe(dojo.hitch(this, function(item, removedIndex, insertedIndex, foo) {
      if (removedIndex > -1) {
        this._dropItem(removedIndex);
      }

      if (insertedIndex > -1) {
        this._addItem(item, insertedIndex);
      }
    }), true);
  },

  clearItems : function() {
    while(this.container.children.length) {
      this._dropItem(0);
    }
  },

  _addItem : function(item, index) {
    var _index = index || 'last', element;
    element = this.itemTemplate(item);
    dojo.place(element, this.container, _index);

    return element;
  },

  _dropItem : function(index) {
    var target = this.container.children[index];
    this.container.removeChild(target);
  },

  destroy : function() {
    this.inherited(arguments);

    this.observation.cancel();
  },

  commastopper : null
});
