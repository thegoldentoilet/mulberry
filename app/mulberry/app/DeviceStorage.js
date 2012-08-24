dojo.provide('mulberry.app.DeviceStorage');

dojo.require('mulberry.Device');

/**
 * Provides an API for interacting with the adapterite databse
 */
mulberry.app.DeviceStorage = (function(){

  return {
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

        window.db = db;

        this.tables = {};

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

    drop : function() {
      var queries = [];

      dojo.forIn(this.tables, function(propName, settings) {
        queries.push("DROP TABLE IF EXISTS " + settings.tableName);
      });

      window.localStorage.clear();

      this.tables = {};

      return this._sql && this._sql(queries);
    },

    set : function(k, v, adapter) {
      var queries;


      if (adapter) {
        this.tables[k] = { 'source' : k, 'adapter' : adapter };

        queries = [
          "DELETE FROM " + adapter.tableName + " WHERE source='" + adapter.source + "'",
          "CREATE TABLE IF NOT EXISTS " + adapter.tableName + "(" + adapter.fields.join(',') + ")"
        ];

        dojo.forEach(v, function(item) {
          queries.push(adapter.insertStatement(adapter.tableName, item));
        });

        return this._sql(queries);
      }

      window.localStorage.setItem(k, JSON.stringify(v));
      return true;
    },

    get : function(k) {
      var adapter;

      if (this.tables.hasOwnProperty(k)) {
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
