dojo.provide('mulberry._Adapter');

/**
 * @class mulberry._Adapter
 *
 * the core class for any retrievable data source
 */
dojo.declare('mulberry._Adapter', null, {
  /**
   * The location of the remote data
   * @required
   */
  remoteDataUrl : '',


  /**
   * @constructor
   */
  constructor : function(config) {
    dojo.mixin(this, config);
  },


  /**
   * @public
   */
  getData : function() {
    var dfd = this.deferred = new dojo.Deferred();

    dojo.when(this._getRemoteData)
      .then(dojo.hitch(this, '_onUpdate'));

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
   * @returns {XHR} A configuration object for passing to dojo.xhrGet
   */
  _xhr : function(url, dfd) {
    return dojo.xhrGet({
      url : url,
      preventCache : true,
      handleAs : 'json',
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
      dojo.hitch(this, '_storeRemoteData', remoteData);
    } else {
      this.deferred.resolve(false);
    }
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
      this._store(remoteData),
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
    this.lastUpdated = new Date().getTime();
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
