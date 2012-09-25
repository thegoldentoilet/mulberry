describe("mulberry device storage api", function() {
  var data, rawData, db, api, f, t, stdConfig;

  beforeEach(function() {
    dojo.require("mulberry.app.DeviceStorage");
    dojo.require("dojo.cache");

    data = dojo.mixin({}, toura.data.local);

    api = mulberry.app.DeviceStorage;

    dojo.provide('foo.bar.baz');
    dojo.declare('foo.bar.baz', null, {
      constructor : function(config) {
        dojo.mixin(this, config);
        this.config = config;
      }
    });

    api.drop();

    stdConfig = {
      'bar' : 'baz',
      'tableName' : 'foo',
      'fields' : [ 'id text', 'json text', 'source text' ]
    };

    f = new foo.bar.baz(stdConfig);

    t = {
      'foo' : {
        'source' : 'foo',
        'adapter' : f,
        'config' : stdConfig
      }
    };
  });

  it("should return a database when initialized", function() {
    db = api.init('foo');

    var type = ({}).toString.call(db);

    expect(type).toEqual('[object Database]');
  });

  it("should set tables correctly", function() {
    db = api.init('foo');

    api._setTables(t);

    expect(api.get('tables')).toEqual({
      'foo' : {
        'source' : 'foo',
        'adapter' : 'foo.bar.baz',
        'config' : stdConfig
      }
    });
  });

  it("should recreate the adapter from local storage", function() {
    db = api.init('foo');

    api._setTables(t);

    expect(api._getTables().foo.adapter).toEqual(f);
  });

  it("should allow the adapter config to be overwritten", function() {
    var adapter = new foo.bar.baz({
      'bar' : 'boff'
    });

    db = api.init('foo');

    api._setTables(t);

    api.set('foo', null, adapter);

    expect(api._getTables().foo.adapter).toEqual(adapter);
  });

  describe("database upgrades", function() {
    var dbSetComplete, dbTestFn, adapter, bar;

    beforeEach(function() {
      dbSetComplete = 0;
      dbTestFn = function() {
        dbSetComplete += 1;
      };
      adapter = new foo.bar.baz(stdConfig);
      bar = {
        testFn : function(d) {
          return d;
        }
      };

      adapter.source = "foo";
      adapter.insertStatement = function(tableName, item) {
        return [
          "INSERT INTO foo (id, json, source) VALUES ( ?, ?, ? )",
          [ item.id , item.meal, this.source ]
        ];
      };
      adapter.processSelection = function(result) {
        var items = [],
            len = result.rows.length,
            i;

        for (i = 0; i < len; i++) {
          items.push({
            id : result.rows.item(i).id,
            json : result.rows.item(i).json,
            source : result.rows.item(i).source
          });
        }

        return items;
      };
    });

    it("should upgrade an old database if one exists", function() {
      spyOn(bar, 'testFn').andCallThrough();

      db = api.init('foo');

      api._sql([
        "DROP TABLE foo",
        "CREATE TABLE foo (id text, value text)",
        "INSERT INTO foo VALUES ('bar', 'baz')"
      ]).then(dbTestFn);

      waitsFor(function() { return dbSetComplete === 1; });

      runs(function() {
        api.set('foo', [{id : 'spam', 'meal': 'eggs'}], adapter).then(dbTestFn);
      });

      waitsFor(function() { return dbSetComplete === 2; });

      runs(function() {
        api.get('foo').then(function(d) {
          bar.testFn(d);
          dbTestFn();
        });
      });

      waitsFor(function() { return dbSetComplete === 3; });

      runs(function() {
        expect(bar.testFn).toHaveBeenCalledWith([{ id : 'spam', json : 'eggs', source : 'foo' }]);
      });
    });

  });
});
