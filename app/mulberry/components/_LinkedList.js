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
  },

  commastopper : null
});
