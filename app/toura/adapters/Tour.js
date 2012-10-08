dojo.provide('toura.adapters.Tour');

dojo.require('mulberry._Adapter');

dojo.declare('toura.adapters.Tour', mulberry._Adapter, {
  // this parser has to do very, very little

  appConfig : {},

  // set to true if this is the main tour.js driving the app
  primaryTour : false,

  fields : [ 'id text', 'json text', 'source text' ],

  tableName : 'items',

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
   * An integer indicating when the remote was last checked for a new version.
   */
  lastChecked : 0,


  constructor : function(config) {
    this.inherited(arguments);
    this.source = config && config.source || 'main';

    this.appConfig = mulberry.app.DeviceStorage.get(this.source + '-app');
  },

  /**************************/
  /* BOOTSTRAP AND UPDATING */
  /**************************/

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
   */
  getData : function() {
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
    }), dojo.hitch(this, function() {
      dojo.hitch(this, '_updateIfNecessary').then(
        dojo.hitch(this, '_onUpdate')
      );
    }));

    return dfd.promise;
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

  /**********************/
  /* VERSION MANAGEMENT */
  /**********************/

  /**
   * @private
   * @returns {Number} The current local version, or -1 if there is no current
   * local version.
   */
  _getLocalVersion : function() {
    var v = this.version || mulberry.app.DeviceStorage.get(this.source + '-version');
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
   *
   * Parse the major version out of a version string as a number.
   */
  _parseMajorVersion: function(versionString) {
    return +versionString.split('.')[0];
  },

  _isAppVersionCompatible: function(versionString) {
    var appVersion = mulberry.app.Config.get('appVersion'),
        appMajorVersion = this._parseMajorVersion(appVersion);

    return appMajorVersion === this._parseMajorVersion(versionString);
  },


  /*******************/
  /* DATA MANAGEMENT */
  /*******************/

  /**
   * @private
   * @returns {Object} A promise which resolves with the bundled data. If
   *                     this is not a primaryTour tour, the tour should have
   *                     no bundled data, so the promise is rejected.
   */
  getBundleData : function() {
    var dfd = new dojo.Deferred();
    if(this.primaryTour) {
      dfd.resolve(toura.data.local);
    } else {
      dfd.reject();
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

      this._processData(data);

      dojo.when(this._store(data), function() {
        dfd.resolve(true);
      });
    }));

    return dfd.promise;
  },

  _processData : function(data) {
    if (data.app) {
      this.appConfig = data.app;
      mulberry.app.DeviceStorage.set(this.source + '-app', data.app);
    }

    if (data.items) {
      // TODO: figure out why this.inherited fails here
      this._items = data.items;
    }

    if (data.version) {
      this.version = data.version;
    }
  },

  _storeRemoteData : function(remoteData) {
    if (remoteData.appVersion && this._isAppVersionCompatible(remoteData.appVersion)) {
      this.inherited(arguments);
    } else {
      this.deferred.resolve(false);
    }
  },

  _store : function(newRemoteData) {
    var dfd = new dojo.Deferred(),
        storeOnDevice;

    if (this._items) {
      storeOnDevice = mulberry.app.DeviceStorage.set(this.source, this._items, this);

      storeOnDevice.then(dojo.hitch(this, function() {
        this._setLocalVersion(this.version);
      }));

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
    this.inherited(arguments);
    if (this.primaryTour) {
      mulberry.app.Config.set('app', this.appConfig);
    }
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
  }
});
