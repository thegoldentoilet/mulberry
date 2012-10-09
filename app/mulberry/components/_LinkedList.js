dojo.provide('mulberry.components._LinkedList');

dojo.require('mulberry._Component');

dojo.declare('mulberry.components._LinkedList', mulberry._Component, {
  /**
   * LinkedList is a type of component that maintains a list of the items
   * stored within an observable dojo store. The LinkedList keeps up with
   * changes in the store & keeps itself updated to match.
   */

  /**
   * the template to use for each item
   */
  itemTemplate : null,


  /**
   * the domNode which contains the list
   *
   * by default, this is the main node (see setupContainer), but could be
   *  a child node.
   */
  container : null,


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
   * sets the component to follow a particular store, and repopulates the
   * list based on that store
   *
   * @param selection {StoreResult} the query result to be displayed. the
   *                                query must be of an observable store
   */
  setStore : function(selection) {
    this.clearItems();

    this.storeData = selection;

    this._checkLength();

    this.storeData.forEach(dojo.hitch(this, '_addItem'));

    if (this.observation) {
      this.observation.cancel();
    }

    this.observation = this.storeData.observe(dojo.hitch(this, function(item, removedIndex, insertedIndex) {
      if (removedIndex > -1) {
        this._dropItem(removedIndex);
      }

      if (insertedIndex > -1) {
        this._addItem(item, insertedIndex);
      }

      this._checkLength();

      this.updated();
    }), true);
  },


  /**
   * @public
   *
   * clears elements from the list
   */
  clearItems : function() {
    dojo.empty(this.container);
  },


  /**
   * @public
   *
   * a stub function for extension. Called whenever the observer is fired
   */
  updated : function() {
    // stub intentionally blank
  },


  /**
   * @private
   *
   * adds or removes the "empty" class based on the items in the store
   */
  _checkLength : function() {
    var l = this.storeData.length;
    if(l === 0) {
      this.addClass('empty');
    } else {
      this.removeClass('empty');
    }
  },


  /**
   * @private
   *
   * adds an item to a list at a given index
   *
   * @param item {Object} The item to be added
   * @param index {Integer} The index at which it should add the item. By
   *                     default it adds to the end of the list.
   */
  _addItem : function(item, index) {
    var _index = index || 'last', element;
    element = this.itemTemplate(item);
    dojo.place(element, this.container, _index);

    return element;
  },

  /**
   * @private
   *
   * removes an item from the list
   *
   * @param index {Integer} The index of the item to be removed.
   */
  _dropItem : function(index) {
    var target = this.container.children[index];
    this.container.removeChild(target);
  },

  /**
   * clean up the observer as it's torn down
   */
  destroy : function() {
    this.inherited(arguments);

    this.observation.cancel();
  }
});
