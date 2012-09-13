dojo.provide('mulberry._Adapter');

/**
 * @class mulberry._Adapter
 *
 * the core class for any retrievable data source
 */
dojo.declare('mulberry._Adapter', null, {
  /**
   * The name of the table to write these items to (usually 'items')
   */
  tableName : 'items',


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
   * An integer indicating when the remote was last checked for a new version.
   */
  lastChecked: 0,


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
   * @param resourceName {String} the name of the resource to fetch data for
   * @returns {Promise} A promise that resolves with
   */
  getData : function(resourceName) {
    var dfd = this.deferred = new dojo.Deferred(),
        lastUpdated = this._getLastUpdate();

    if (lastUpdated === null || new Date().getTime() - lastUpdated > this.refreshTimer) {
      dojo.when(this._getRemoteData)
        .then(dojo.hitch(this, '_onUpdate'));
    } else {
      // here we just fetch and return the data...
    }

    return dfd.promise;
  },


  /**
   * @public
   *
   * This method allows consumers to request the items associated with the
   * resource. It must be implemented by subclasses.
   *
   * @returns {Array} An array of items
   */
  getItems : function() {
    return this._items || [];
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
    } else {
      this.deferred.resolve(false);
    }
  },

  /**
   * @private
   *
   * Checks for the time of the most recent update for this resource
   *
   * @param resourceName {String} the resource to check
   * @returns UNIX timestamp of last update, or null if there has never
   *          been an update
   */
  _getLastUpdate : function(resourceName) {
    return mulberry.app.DeviceStorage.get(resourceName + "-updated");
  },

  /**
   * @private
   *
   * Records the time of an update
   *
   * @param resourceName {String} the resource being updated
   */
  _setLastUpdate : function(resourceName) {
    mulberry.app.DeviceStorage.set(resourceName + "-updated", new Date().getTime());
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
    dojo.when(
      this._store(remoteData, true),
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
   * Instructions for storing the data. This should be extended by
   * subclasses if necessary.
   */
  _store : function(sourceData) {
    this._items = sourceData.items;
  },


  /**
   * @private
   *
   * Things to do once we know the data's ready -- to be implemented by
   * subclasses if necessary.
   */
  _onDataReady : function() { }

});
