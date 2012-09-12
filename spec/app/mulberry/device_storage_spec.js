describe("mulberry device storage api", function() {
  var data, rawData, db, api, f, t;

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

    f = new foo.bar.baz({ 'bar' : 'baz' });
    t = {
      'foo' : { 'source' : 'foo', 'adapter' : f }
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
      'foo' : { 'source' : 'foo', 'adapter' : 'foo.bar.baz', 'config' : { 'bar' : 'baz'} }
    });
  });

  it("should recreate the adapter from local storage", function() {
    db = api.init('foo');

    api._setTables(t);

    expect(api._getTables().foo.adapter).toEqual(f);
  });

});
