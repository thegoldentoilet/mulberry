dojo.provide('mulberry.app.DeviceStorage');

dojo.require('mulberry.Device');

/**
 * Provides an API for interacting with WebSQL and local storage
 */
mulberry.app.DeviceStorage = (function(){

  return {
    /**
     * @public
     *
     * creates the DeviceStorage system
     *
     * in particular, this sets up the system for mulberry to interact with
     * the sql database (and it prevents the app crashing in an environment
     * lacking WebSQL). It also sets up the tables array and its persistent
     * localStorage counterpart.
     */
    init : function(appId) {
      this.appId = appId;

      if (!('openDatabase' in window)) {
        this._sql = function() {
          var dfd = new dojo.Deferred();
          dfd.resolve();
          return dfd.promise;
        };
      } else {

        var db = this._db = openDatabase(
          // short db name
          appId + '-' + mulberry.version,

          // sqlite version
          "1.0",

          // long db name
          appId + ' Database',

          // database size
          5 * 1024 *1024
        );

        if (!db) {
          console.log('No database. This will end badly.');
        }

        // TODO: get rid of this caching adapters stuff
        /**
         * @private
         *
         * retrieves the tables array from local storage (if present) and
         * reconstitutes any adapters stored in it from their config data
         *
         * NB: this caching system is annoying, complicated, and probably
         *     should be refactored into something less fragile and weird
         *     at a later date
         */
        this._getTables = function() {
          var tables = mulberry.app.DeviceStorage.get('tables');

          if (tables === null) {
            return null;
          }

          // reconstitute the adapters by fetching the core class by name
          // and instantiating them with the provided config
          dojo.forIn(tables, function(key, table) {
            var adapter = dojo.getObject(table.adapter);
            tables[key].adapter = new adapter(table.config);
            delete tables[key].config;
          });

          return tables;
        };

        /**
         * @private
         *
         * caches enough data about the tables array into localStorage so
         * it can be reconstituted later by _getTables
         */
        this._setTables = function(tables) {
          var storedTables = {};
          dojo.forIn(tables, function(key, table) {
            storedTables[key] = dojo.clone(tables[key]);
            storedTables[key].adapter = table.adapter.declaredClass;
            storedTables[key].config = table.adapter.config;
          });
          mulberry.app.DeviceStorage.set('tables', storedTables);
        };

        this.tables = this._getTables() || {};

        this._sql = function(queries, formatter) {
          var dfd = new dojo.Deferred(),
              len;

          queries = dojo.isArray(queries) ? queries : [ queries ];
          len = queries.length;

          db.transaction(function(t) {

            dojo.forEach(queries, function(q, i) {
              var last = i + 1 === len,
                  cb, eb, params = [];

              if (last) {
                cb = dojo.isFunction(formatter) ?
                      function(t, data) {
                        dfd.callback(formatter(data));
                      } :
                      dfd.callback;

                eb = dfd.errback;
              } else {
                cb = eb = function() {};
              }

              if (dojo.isArray(q)) {
                params = q[1];
                q = q[0];
              }

              t.executeSql(q, params, cb, eb);
            });

          });

          return dfd.promise;
        };
      }

      // don't let database be initialized again
      return this._db;
    },

    /**
     * @public
     *
     * this method clears out the database and localStorage. WebSQL lacks
     * a method for dropping a database entirely, so it must iterate over
     * the tables array and drop the tables one by one
     */
    drop : function() {
      var queries = [];

      dojo.forIn(this.tables, function(propName, settings) {
        queries.push("DROP TABLE IF EXISTS " + settings.tableName);
      });

      window.localStorage.clear();

      this.tables = {};

      return this._sql && this._sql(queries);
    },

    /**
     * @public
     *
     * this sets a value in localStorage OR it repopulates all a source's
     * content in WebSQL, depending on its arguments and the tables array
     *
     * basically: if the provided key is in the tables array, it will use
     * WebSQL. if it is provided an adapter, it will use WebSQL. elsewise
     * it will write to localStorage.
     *
     * NB: a perceptive reader will realize this means when you see a set
     *     call, you can not distinguish by reading whether it will write
     *     to localStorage or to WebSQL. caveat programmer.
     *
     *     also TODO: refactor localStorage/webSQL into two functions
     *
     * @name localStorage
     * @param k {String} the localStorage key
     * @param v {String|Array|Object} the value to store. if the value is
     *                   not a string, it is first converted to JSON
     *
     * @name WebSQL
     * @param k {String} the name of the source to set
     * @param v {Array|Null} the data to write into the source. when this
     *                   value is null, the provided adapter is logged to
     *                   to the tables array, but the saved data will not
     *                   be altered
     * @param [adapter] {Adapter} if one is provided, the adapter will be
     *                   used to write the provided data to the database;
     *                   otherwise the adapter will be fetched out of the
     *                   tables array
     * @returns {Promise} a promise that resolves with all stored data of
     *                   the specified source
     */
    set : function(k, v, adapter) {
      var queries, upgradeTest, createQuery, fieldNames;

      // if we already know the adapter, we're set...
      if (this.tables && this.tables.hasOwnProperty(k)) {
        adapter = this.tables[k].adapter;
      } else if (adapter) {
        this.tables[k] = { 'source' : k, 'adapter' : adapter };
        this._setTables(this.tables);
      }

      if (!adapter) {
        // local storage!
        window.localStorage.setItem(k, JSON.stringify(v));
        return true;
      }

      // WebSQL!
      if (v === null) {
        // this is in so the bootstrap can set up the tables array
        // without overwriting the data
        return null;
      }

      // ensure that a source field exists
      if (adapter.fields.indexOf('source text') === -1) {
        adapter.fields.push('source text');
      }

      fieldNames = adapter.fields.map(function(rawFieldName) { return rawFieldName.split(' ')[0]; });

      createQuery = "CREATE TABLE IF NOT EXISTS " + adapter.tableName + "(" + adapter.fields.join(',') + ")";

      // we need to test that the existing table has the fields we expect
      //
      // we run the create query first to be sure the table exists so the
      // select query does not fail
      upgradeTest = this._sql([
        createQuery,
        "SELECT * FROM " + adapter.tableName + " LIMIT 1"
      ], function(resp) {
        if (resp.rows.length === 0) {
          return false;    // this is an empty table, may as well drop it
                           // & recreate
        }
        // if the field names do not line up, the only way we can proceed
        // is by dropping the table entirely
        return fieldNames.reduce(function(memo, fieldName) { return memo && resp.rows.item(0).hasOwnProperty(fieldName); });
      });

      return upgradeTest.then(dojo.hitch(this, function(resp) {
        if (resp === false) {
          queries = ["DROP TABLE " + adapter.tableName];
        } else {
          queries = ["DELETE FROM " + adapter.tableName + " WHERE source='" + adapter.source + "'"];
        }

        queries.push(createQuery);

        dojo.forEach(v, function(item) {
          queries.push(adapter.insertStatement(adapter.tableName, item));
        });

        return this._sql(queries);
      }));
    },

    /**
     * @public
     *
     * retrieves data from webSQL or localStorage
     *
     * @name localStorage
     * @param k {String} the localStorage key to retrieve
     * @returns {String|Array|Object} the data stored in localStorage. if
     *                   this data is be JSON-parseable, it returns as an
     *                   array or object as appropriate
     *
     * @name webSQL
     * @param k {String} the source to retrieve data for
     * @returns {Promise} a promise that resolves with the data that goes
     *                   with this key
     */
    get : function(k) {
      var adapter;

      if (this.tables && this.tables.hasOwnProperty(k)) {
        adapter = this.tables[k].adapter;

        return this._sql("SELECT * FROM " + adapter.tableName, adapter.processSelection);
      }

      var ret = window.localStorage.getItem(k);
      if (ret === 'undefined') { ret = null; }
      ret = ret && JSON.parse(ret);
      return ret;
    }
  };
}());
