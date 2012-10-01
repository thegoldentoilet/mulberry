dojo.provide('toura.adapters.tourjs');

dojo.require('toura.adapters._Updateable');

dojo.declare('toura.adapters.tourjs', toura.adapters._Updateable, {
  // this parser has to do very, very little

  appConfig : {},

  // set to true if this is the main tour.js driving the app
  blessed : false,

  fields : [ 'id text', 'json text', 'source text' ],

  constructor : function(config) {
    this.inherited(arguments);
    this.source = config && config.source || 'main';

    this.appConfig = mulberry.app.DeviceStorage.get(this.source + '-app');
  },

  insertStatement : function(tableName, item) {
    return [
      "INSERT INTO " + tableName + " (id, json, source) VALUES ( ?, ?, ? )",
      [ item.id, JSON.stringify(item), this.source ]
    ];
  },

  getRootNodes : function() {
    if (!this.appConfig || !this.appConfig.homeNodeId) { return; }

    return toura.Data.getModel(this.appConfig.homeNodeId, 'node').children;
  },

  _processData : function(data) {
    if (data.app) {
      this.appConfig = data.app;
      mulberry.app.DeviceStorage.set(this.source + '-app', data.app);
    }

    if (data.items) {
      this._items = data.items;
    }
  },

  _store : function(newRemoteData) {
    var dfd = new dojo.Deferred(),
        storeOnDevice;

    if (this._items) {
      storeOnDevice = mulberry.app.DeviceStorage.set(this.source, this._items);

      if (newRemoteData) {
        // if what we're storing is new remote data, then we should
        // wait until it's stored before we resolve the deferred
        storeOnDevice.then(function() { dfd.resolve(true); });
      } else {
        // if it's not new remote data, we don't need to wait until it's
        // stored; we can just proceed immediately.
        dfd.resolve(true);
      }
    }

    return dfd.promise;
  },

  getBundleData : function() {
    var dfd = new dojo.Deferred();
    dfd.resolve(toura.data.local);
    return dfd.promise;
  },

  _onDataReady : function() {
    this.inherited(arguments);
    if (this.blessed) {
      mulberry.app.Config.set('app', this.appConfig);
    }
  }
});
