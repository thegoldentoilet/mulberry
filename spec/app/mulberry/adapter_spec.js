describe("base _Adapter class", function() {
  var mockjax, ajaxMocks, adapter, config;

  beforeEach(function() {
    dojo.require('mulberry._Adapter');

    mockjax = function (args) {
      var dfd = new dojo.Deferred();

      if (ajaxMocks[args.url]) {
        if (args.load) {
          args.load(ajaxMocks[args.url]);
        }

        dfd.resolve(ajaxMocks[args.url]);
      } else {
        if (args.error) {
          args.error();
        }

        dfd.reject();
      }

      return dfd;
    };

    mulberry.app.PhoneGap = {
      network : {
        isReachable : function() {
          var dfd = new dojo.Deferred();
          dfd.resolve(true);
          return dfd.promise;
        }
      }
    };

    dojo.xhrGet = dojo.io.script.get = mockjax;

    dojo.provide('mulberry.app.PhoneGap.network');

  });

  it("should initialize properly with a config", function() {
    config = {
      'foo' : 'bar',
      'baz' : 'biz'
    };

    adapter = new mulberry._Adapter(config);

    expect(adapter.config).toEqual(config);
    expect(adapter.foo).toEqual(config.foo);
    expect(adapter.baz).toEqual(config.baz);
  });

  describe("data fetching", function() {
    var deferred, resolveTest = false;

    beforeEach(function() {
      dojo.require('mulberry.app.DeviceStorage');

      mulberry.app.DeviceStorage.drop();
      mulberry.app.DeviceStorage.init();

      ajaxMocks = {
        'foo' : {
          'bar' : 'baz'
        }
      };
    });

    it("should store data internally", function() {
      adapter = new mulberry._Adapter({
        remoteDataUrl : 'foo',
        source: 'bar'
      });

      deferred = adapter.getData();

      deferred.then(function() { resolveTest = true; });

      waitsFor(function() { return resolveTest; });

      runs(function() {
        expect(adapter._items).toEqual(ajaxMocks.foo);
      });
    });

    it("should resolve false when no url is given", function() {
      var result = null;

      adapter = new mulberry._Adapter({
        source : 'foo'
      });

      deferred = adapter.getData();

      deferred.then(function(d) {
        result = d;
        resolveTest = true;
      });

      waitsFor(function() { return resolveTest; });

      runs(function() {
        expect(result).toEqual(false);
      });
    });

    // it("should resolve false when xhr fails", function() {
    //   var result = null;

    //   adapter = new mulberry._Adapter({
    //     source : 'foo',
    //     remoteDataUrl : 'bar'
    //   });

    //   mockjax = function() {
    //     var dfd = new dojo.Deferred();
    //     dfd.reject();
    //     return dfd;
    //   };

    //   deferred = adapter.getData();

    //   deferred.then(function(d) {
    //     result = d;
    //     resolveTest = true;
    //   });

    //   waitsFor(function() { return resolveTest; });

    //   runs(function() {
    //     expect(result).toEqual(false);
    //   });
    // });

  });
});
