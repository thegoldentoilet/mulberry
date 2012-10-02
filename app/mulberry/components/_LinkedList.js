dojo.provide('mulberry.components._LinkedList');

dojo.require('mulberry._Component');

dojo.declare('mulberry.components._LinkedList', mulberry._Component, {
  /**
   * LinkedList is a type of component that maintains a list of items
   * stored within an observable dojo store. The LinkedList keeps its
   * list up to date with the store.
   */

  itemTemplate : null

});
