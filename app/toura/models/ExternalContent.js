dojo.provide('toura.models.ExternalContent');

dojo.require('dojo.date.stamp');
dojo.require('mulberry.app.DeviceStorage');
dojo.require('mulberry._Adapter');

/**
 * @class
 */
dojo.declare('toura.models.ExternalContent', null, {
  throttle : 5 * 1000, // 5 seconds

  lastChecked : 0,

  /**
   * @constructor
   */
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : store.getValue(item, 'id'),
      name : store.getValue(item, 'name'),
      sourceUrl : store.getValue(item, 'sourceUrl')
    });

    this.adapter = this._getAdapter(store.getValue(item, 'adapter'));
  },

  /**
   * @public
   */
  load : function(node) {
    var dfd, now = new Date().getTime();

    if(this.lastChecked + this.throttle > now) { return; }
    this.lastChecked = now;

    dfd = this.adapter.getData();

    dfd.then(dojo.hitch(this, function() {
      node.addExternalChildren(this.adapter.getRootNodes());
    }));
  },

  /**
   * @private
   *
   * Fetches the appropriate adapter from DeviceStorage.tables or
   * creates it from the ExternalContent data
   *
   * @param adapter {String} The name of the adapter for this content
   * @returns {Adapter} The instance of the adapter tailored to this content
   */
  _getAdapter : function(adapter) {
    var adapterRef = toura.adapters[adapter] || null,
        fullAdapter;

    if (!adapterRef) {
      console.error("the adapter for " + this.name + " was not found. This will end badly.");
      // TODO: Proper error classes?
      throw "MissingAdapter";
    }

    if (mulberry.app.DeviceStorage.tables.hasOwnProperty(this.name)) {
      fullAdapter = mulberry.app.DeviceStorage.tables[this.name].adapter;
    } else {
      fullAdapter = new adapterRef({
        remoteDataUrl : this.sourceUrl,
        source : this.name
      });
      // TODO:  should this add the adapter to the tables array?
    }

    return fullAdapter;
  }
});
