dojo.provide('mulberry._Adapter');

/**
 * @class mulberry._Adapter
 *
 * the core class for any retrievable data source
 *
 * Adapters serve to connect mulberry apps to external data sources. New
 * adapters should read in data from an external source (an RSS feed, an
 * API, etc.) and parse/convert its data into models within the mulberry
 * app. The adapter also handles keeping mulberry's copy of this content
 * up to date with the remote data source.
 */
dojo.declare('mulberry._Adapter', null, {
  /**
   * The name of the table to write these items to (usually 'items')
   */
  tableName : null,


  /**
   * The name of the source (required)
   */
  source : null,

  /**
   * The location of the remote data
   * @required
   */
  remoteDataUrl : '',

  /**
   * The time after which the data becomes "stale"
   * in milliseconds
   */
  refreshTimer : 60 * 60 * 1000,      // = 1 hour in milliseconds


  /**
   * The field list for the table this adapter uses
   */
  fields : null,


  /**
   * @constructor
   */
  constructor : function(config) {
    dojo.mixin(this, config);
    this.config = config;
  },


  /**
   * @public
   *
   * gets data for a particular resource
   *
   * @returns {Promise} A promise that resolves with a boolean value:
   *                    if the data was updated, it returns true; otherwise
   *                    it returns false
   */
  getData : function() {
    var dfd = this.deferred = new dojo.Deferred(),
        lastUpdated = this._getLastUpdate(),
        data;

    if (lastUpdated === null || new Date().getTime() - lastUpdated > this.refreshTimer) {
      dojo.when(
        this._getRemoteData(),
        dojo.hitch(this, '_onUpdate'),
        dojo.hitch(this, function() {
          dfd.reject();
        })
      );
    } else {
      // here we just fetch and return the data...
      mulberry.app.DeviceStorage.get(this.source).then(dojo.hitch(this, function(d) {
        this._items = d;
        dfd.resolve(false);
      }));
    }

    return dfd.promise;
  },


  /**
   * @public
   *
   * This method allows consumers to request the items associated with the
   * resource. It must be implemented by subclasses.
   *
   * @returns {Promise} A promise for the array
   */
  getItems : function() {
    var dfd = new dojo.Deferred();

    // wait for the adapter startup before trying to return data
    this.deferred.then(dojo.hitch(this, function() {
      if (this._items && this._items.length) {
        dfd.resolve(this._items);
      } else {
        if (!this.source) {
          dfd.reject();
          return;
        }
        mulberry.app.DeviceStorage.get(this.source)
          .then(dojo.hitch(this, function(items) {
            this._items = items;
            dfd.resolve(items);
          }));
      }
    }));

    return dfd.promise;
  },


  /**
   * @public
   *
   * The default SQL insert statement for an adapter. This should likely be
   * altered/extended by real adapters. It is called in mulberry.app.DeviceStorage.set
   *
   * @param tableName {String} the name of the table to add to
   * @param item {Object} the object to add
   * @returns {SQL Array} for inserting into the SQL query array in
   *                      mulberry.app.DeviceStorage.set
   */
  insertStatement : function(tableName, item) {
    return [
      "INSERT INTO " + tableName + " (json, source) VALUES ( ? )",
      [ JSON.stringify(item), this.source ]
    ];
  },


  /**
   * @public
   *
   * A parser for SQL results when fetching this data out of the SQL
   * database. This should likely be altered/extended by real adapters.
   * It is called in mulberry.app.DeviceStorage.get
   *
   * @param result {SQL Result} the result to parse
   * @returns {Array} the array of parsed results
   */
  processSelection : function(result) {
    var items = [],
        len = result.rows.length,
        rowData, i;

    for (i = 0; i < len; ++i) {
      rowData = result.rows.item(i).json;
      items.push(rowData ? JSON.parse(rowData) : {});
    }

    return items;
  },


  /**
   * @private
   * @param {String} url The url for the request
   * @param {Object} dfd The deferred that should be rejected or resolved
   * @param {String} protocol (Optional) The protocol that should be used
   *   to handle the XHR. Default is json
   * @param {String} callbackParamName (Optional) The URL parameter name
   *   that indicaten the JSONP callback string. Only used for jsonp;
   *   defaults to this.callbackParamName if not specified.
   * @returns {XHR} A configuration object for passing to dojo.xhrGet
   */
  _xhr : function(url, dfd, protocol, callbackParamName) {
    protocol = protocol || 'json';
    callbackParamName = callbackParamName || this.callbackParamName || undefined;

    if (protocol == 'jsonp' && !callbackParamName) {
      return dfd.reject;
    }

    return protocol === 'jsonp' ?
      mulberry.jsonp(url, {
        callbackParamName : callbackParamName,
        preventCache : true,
        load : dfd.resolve,
        error : dfd.reject
      }) :
      dojo.xhrGet({
        url : url,
        preventCache : true,
        handleAs : protocol,
        contentType : false,
        load : dfd.resolve,
        error : dfd.reject
      });
  },


  /**
   * @private
   *
   * Checks for remote data and does minimal validation.
   *
   * @param {Object} remoteData The incoming remote data to update with
   */
  _onUpdate : function(remoteData) {
    if (remoteData) {
      // if there was remote data, we need to store it
      this._storeRemoteData(remoteData);
      this._setLastUpdate();
    } else {
      this.deferred.resolve(false);
    }
  },

  /**
   * @private
   *
   * Checks for the time of the most recent update for this resource
   *
   * @returns UNIX timestamp of last update, or null if there has never
   *          been an update
   */
  _getLastUpdate : function() {
    return mulberry.app.DeviceStorage.get(this.source + "-updated");
  },

  /**
   * @private
   *
   * Records the time of an update
   */
  _setLastUpdate : function() {
    mulberry.app.DeviceStorage.set(this.source + "-updated", new Date().getTime());
  },


  /**
   * @public
   *
   * Gets the root nodes which are meant to be appended to the node this
   * adapted content is pulled into
   *
   * @returns {Array} The ordered array of nodes to append
   */
  getRootNodes : function() {
    return [];
  },


  /**
   * @private
   *
   * This method actually stores the data once it's passed through _onUpdate.
   * It is separated out to make it easy to add validation of the remote data.
   *
   * @param {Object} remoteData The incoming remote data to update with
   */
  _storeRemoteData : function(remoteData) {
    this._processData(remoteData);
    dojo.when(
      this._store(true),
      dojo.hitch(this, function() {
        // once we've stored it, we have a chance to run a hook
        this._onDataReady();

        // finally, we're done -- we resolve true to indicate we
        // updated the data successfully
        this.deferred.resolve(true);
      })
    );
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
            this._xhr(this.remoteDataUrl, dfd);
          }),
          function() {
            dfd.resolve(false);
          }
        );
    }

    return dfd.promise;
  },



  /**
   * @private
   *
   * This parses the incoming data and caches it into the adapter's
   * memory for easy reference. This should be extended by subclasses
   * if necessary.
   *
   * @param sourceData {Object} The data to be parsed and logged.
   */
  _processData : function(sourceData) {
    this._items = sourceData;
  },


  /**
   * @private
   *
   * Instructions for storing the data. This should be extended by
   * subclasses if necessary.
   *
   * @param newRemoteData {Boolean} If true, there is new remote data
   *                                to store
   */
  _store : function(newRemoteData) {
    mulberry.app.DeviceStorage.set(this.source, this._items, this);
  },


  /**
   * @private
   *
   * Things to do once we know the data's ready -- to be implemented by
   * subclasses if necessary.
   */
  _onDataReady : function() {
    // stub intentionally blank
  }

});
