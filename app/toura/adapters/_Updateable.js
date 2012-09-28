dojo.provide('toura.adapters._Updateable');

dojo.require('mulberry._Adapter');
dojo.require('mulberry.app.DeviceStorage');
dojo.require('dojo.io.script');

/**
 * @class toura.adapters._Updateable
 *
 * A base class for toura's updateable resources.
 */
dojo.declare('toura.adapters._Updateable', mulberry._Adapter, {
  /**
   * The location of the bundled data, if any
   * @optional
   */
  bundleDataUrl : '',

  /**
   * The location of the remote version information
   * @required
   */
  remoteVersionUrl : '',

  /**
   * @public
   *
   * This method ensures that bundled data has been loaded into the
   * application, and then checks to see whether there is newer data available
   * on the remote. If there is newer data available, then the local data is
   * replaced with the newer data.
   *
   * @returns {Promise} A promise that, if resolved, will be resolved with a
   * boolean value. If the value is true, then the data was updated during the
   * bootstrapping process.
   *
   * TODO: convert this to an extension of [super].getData
   */
  bootstrap : function() {
    var localVersion = this._getLocalVersion(),
        dfd = this.deferred = new dojo.Deferred();

    this.getBundleData().then(dojo.hitch(this, function(bundleData) {
      var bundleVersion = bundleData.version,
          initializeRequired = (localVersion === null) ||
            (bundleVersion === null) ||
            (localVersion < bundleVersion);

      dojo.when(
        initializeRequired ? this._initializeData(bundleData) : true,
        dojo.hitch(this, '_updateIfNecessary')
      ).then(dojo.hitch(this, '_onUpdate'));
    }));

    return dfd.promise;
  },

  _storeRemoteData : function(remoteData) {
    if (remoteData.appVersion && this._isAppVersionCompatible(remoteData.appVersion)) {
      this.inherited(arguments);
    } else {
      this.deferred.resolve(false);
    }
  },

  _isAppVersionCompatible: function(versionString) {
    var appVersion = mulberry.app.Config.get('appVersion'),
        appMajorVersion = this._parseMajorVersion(appVersion);

    return appMajorVersion === this._parseMajorVersion(versionString);
  },

  _updateIfNecessary : function() {
    // update the local version if it was originally < 0
    var dfd = new dojo.Deferred(),
        localVersion = this._getLocalVersion();

    dojo.when(
      // first, get the remote version
      this._getRemoteVersion(),

      // once we have the remote version ...
      dojo.hitch(this, function(remoteVersionData) {
        var appMajorVersion = this._parseMajorVersion(mulberry.app.Config.get('appVersion'));

        if (remoteVersionData) {
          remoteVersionData.appVersion = remoteVersionData.appVersion || "2.0";
        }

        // check that app and remote major versions are compatible and that
        // remote version is newer than the local version or local version is null.
        if (
           remoteVersionData &&
           this._isAppVersionCompatible(remoteVersionData.appVersion) &&
           (remoteVersionData.version > localVersion)
        ) {

          // if the remote version is newer, we need to fetch new data from the remote
          this._getRemoteData()
            .then(
              // once we have new remote data ...
              dojo.hitch(this, function(remoteData) {
                if (!remoteData) {
                  // if it was empty for some reason, we're done
                  dfd.resolve(false);
                  return;
                }
                dfd.resolve(remoteData);
              })
            );
        } else {
          // if the remote version isn't newer, the local data we have is fine

          // again, we have a chance to run a hook if we need
          this._onDataReady();

          // since we didn't update the data, we resolve the dfd false
          dfd.resolve(false);
        }
      }),

      // ... hm, we did not get the remote version
      dojo.hitch(this, function(error) {
        // 404 or 503 OK, proceed as if there is no update
        if (error.status === 404 || error.status === 503) {
          // again, we have a chance to run a hook if we need
          this._onDataReady();
        }
        dfd.resolve(false);
      })
    );

    return dfd.promise;
  },

  /**
   * @private
   * @returns {Promise} A promise that, if resolved, will be resolved with the
   * current version of the remote data.
   */
  _getRemoteVersion : function() {
    this.lastChecked = new Date().getTime();

    var dfd = new dojo.Deferred();

    if (mulberry.skipVersionCheck || !this.remoteVersionUrl) {
      dfd.resolve(null);
    } else {
      mulberry.app.PhoneGap.network.isReachable()
        .then(
          dojo.hitch(this, function(isReachable) {
            if (!isReachable) {
              dfd.resolve(null);
              return;
            }

            this._xhr(this.remoteVersionUrl, dfd);
          }),

          dfd.reject
        );
    }

    return dfd.promise;
  },

  /**
   * @private
   * @returns {Number} The current local version, or -1 if there is no current
   * local version.
   */
  _getLocalVersion : function() {
    var v = mulberry.app.DeviceStorage.get(this.source + '-version');
    return v;
  },

  /**
   * @private
   */
  _setLocalVersion : function(v) {
    mulberry.app.DeviceStorage.set(this.source + '-version', v);
  },


  /**
   * @private
   * @returns {Object} The bundled data
   */
  getBundleData : function() {
    var dfd = new dojo.Deferred();

    if (!this.bundleDataUrl) {
      dfd.resolve();
      return dfd.promise;
    }

    dojo.io.script.get({
      url : this.bundleDataUrl,
      preventCache : true
    }).then(dfd.resolve, dfd.reject);

    return dfd.promise;
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

  /**
   * @private
   *
   * This method loads and stores the bundled data.
   *
   * @returns {Promise}
   */
  _initializeData : function(bundleData) {
    var dfd = new dojo.Deferred();

    dojo.when(bundleData || this.getBundleData(), dojo.hitch(this, function(data) {
      if (!data) {
        dfd.resolve(false);
        return;
      }

      dojo.when(this._store(data), function() {
        dfd.resolve(true);
      });
    }));

    return dfd.promise;
  },

  /**
   * @private
   *
   * Update the version flag
   */
  _store : function(sourceData) {
    this._items = sourceData.items;
    this._setLocalVersion(sourceData && sourceData.version);
  },

  /**
   * @private
   *
   * Parse the major version out of a version string as a number.
   */
  _parseMajorVersion: function(versionString) {
    return +versionString.split('.')[0];
  }

});
