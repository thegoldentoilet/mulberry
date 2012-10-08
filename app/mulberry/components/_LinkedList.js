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
   * @public
   *
   * sets the component to follow a particular store, and repopulates
   * it based on that store
   *
   * @param selection {StoreResult} the query result to display. the query must
   *                                be from an observable store
   */
  setStore : function(selection) {
    this.storeData = selection;

    this.storeData.forEach(dojo.hitch(this, '_addItem'));

    if (this.observation) {
      this.observation.cancel();
    }

    this.observation = this.storeData.observe(dojo.hitch(this, function(item, removedIndex, insertedIndex, foo) {

      if (insertedIndex > -1) {
        this._addItem(item, insertedIndex);
      }
    }), true);
  },

  _addItem : function(item, index) {
    var _index = index || 'last', element;
    element = this.itemTemplate(item);
    dojo.place(element, this.domNode, _index);

    return element;
  },

  _dropItem : function(index) {
    var target = this.domNode.children[index];
    this.domNode.removeChild(target);
  },

  commastopper : null
});
