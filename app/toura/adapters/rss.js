dojo.provide('toura.adapters.rss');

dojo.require('toura.adapters._Adapter');

dojo.declare('toura.adapters.rss', toura.adapters._Adapter, {
  // this parser has to do very, very little

  tableName: 'items',

  storageKey : 'tour',

  fields : [ 'id text', 'json text', 'source text' ],

  constructor : function(dataUrl) {
    this.remoteDataUrl = dataUrl;    
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
      mulberry.app.DeviceStorage.get('tour')
        .then(dojo.hitch(this, function(items) {
          this._items = items;
          dfd.resolve(items);
        }));
    }

    return dfd.promise;
  },

  _store : function(data, newRemoteData) {
    this.inherited(arguments);

    var dfd = new dojo.Deferred(),
        storeOnDevice;

    if (data.app) {
      mulberry.app.DeviceStorage.set('app', data.app);
    }

    if (data.items) {
      storeOnDevice = mulberry.app.DeviceStorage.set('tour', data.items, toura.adapters.rss());

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



  _onDataReady : function() {
    var appConfig = mulberry.app.DeviceStorage.get('app');
    mulberry.app.Config.set('app', appConfig);
  },

  /**
   * @private
   * @returns {Promise} A promise that, if resolved, will be resolved with the
   * remote data.
   */
  _getRemoteData : function() {
    var dfd = new dojo.Deferred();

    if (!this.remoteDataUrl) {
      dfd.resolve(false);
    } else {
      mulberry.app.PhoneGap.network.isReachable()
        .then(
          dojo.hitch(this, function() {
            this._jsonp(this.remoteDataUrl, config);
          }),
          function() {
            dfd.resolve(false);
          }
        );
    }

    return dfd.promise;
  }
});
