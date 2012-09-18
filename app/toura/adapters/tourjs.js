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
      "INSERT INTO " + tableName + "(id, json, source) VALUES ( ?, ?, ? )",
      [ item.id, JSON.stringify(item), this.source ]
    ];
  },

  processSelection : function(result) {
    var items = [],
        len = result.rows.length,
        rowData, i;

    for (i = 0; i < len; i++) {
      rowData = result.rows.item(i).json;
      items.push(rowData ? JSON.parse(rowData) : {});
    }

    return items;
  },

  getItems : function() {
    var dfd = new dojo.Deferred();

    if (this._items) {
      dfd.resolve(this._items);
    } else {
      mulberry.app.DeviceStorage.get(this.source)
        .then(dojo.hitch(this, function(items) {
          this._items = items;
          dfd.resolve(items);
        }));
    }

    return dfd.promise;
  },

  getRootNodes : function() {
    if (!this.appConfig || !this.appConfig.homeNodeId) { return; }

    return toura.Data.getModel(this.appConfig.homeNodeId, 'node').children;
  },

  _store : function(data, newRemoteData) {
    this.inherited(arguments);

    var dfd = new dojo.Deferred(),
        storeOnDevice;

    if (data.app) {
      this.appConfig = data.app;
      mulberry.app.DeviceStorage.set(this.source + '-app', data.app);
    }

    if (data.items) {
      storeOnDevice = mulberry.app.DeviceStorage.set(this.source, data.items);

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
    if (this.blessed) {
      mulberry.app.Config.set('app', this.appConfig);
    }
  }
});
