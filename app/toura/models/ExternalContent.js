dojo.provide('toura.models.ExternalContent');

dojo.require('dojo.date.stamp');
dojo.require('mulberry.app.DeviceStorage');

(function() {

/**
 * @class
 *
 * @property {Number} throttle  The time in milliseconds to wait between
 * fetches
 * @property {String} feedUrl
 * @property {String} id
 * @property {String} name
 * @property {Number} lastChecked
 * @property {Array} items
 * @property {Number} updated
 */
dojo.declare('toura.models.ExternalContent', null, {
  throttle : 5 * 1000, // 5 seconds

  /**
   * @constructor
   */
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : store.getValue(item, 'id'),
      name : store.getValue(item, 'name'),
      adapter : this._getAdapter(store.getValue(item, 'adapter')),
      sourceUrl : store.getValue(item, 'sourceUrl')
    });
  },

  /**
   * @public
   */
  load : function(node) {

  },

  /**
   * @private
   */
  _getAdapter : function(adapter) {
    fullAdapter = toura.adapters[adapter] || null;

    if (!fullAdapter) {
      console.error("the adapter for " + this.name + " was not found. This will end badly.");
    }

    return fullAdapter;
  }

  // load method -- requires node, delegates to adapter, adds to
  // node on xhr callback

});

}());
