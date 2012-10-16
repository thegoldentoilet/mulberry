describe("base _Adapter class", function() {
  var mockjax, ajaxMocks, adapter, config,
      tableName = 'adapterTest',
      fields = ['json text', 'source text'],
      source = 'adapterTest',
      deviceStorageInit, deviceStorageGet;

  beforeEach(function() {
    dojo.require('mulberry._Adapter');
    dojo.require('mulberry.app.DeviceStorage');
    if(!deviceStorageInit) {
      mulberry.app.DeviceStorage.drop();
      mulberry.app.DeviceStorage.init('foo');
      deviceStorageInit = true;
      deviceStorageGet = mulberry.app.DeviceStorage.get;
    }

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
      'baz' : 'biz',
      tableName : tableName,
      fields : fields,
      source : source
    };

    adapter = new mulberry._Adapter(config);

    expect(adapter.config).toEqual(config);
    expect(adapter.foo).toEqual(config.foo);
    expect(adapter.baz).toEqual(config.baz);
  });

  describe("data management", function() {
    var deferred, resolveTest;

    beforeEach(function() {
      resolveTest = false;

      ajaxMocks = {
        'foo' : [
          { 'bar' : 'baz' }
        ]
      };
    });

    describe("getData", function() {
      var startTime;

      beforeEach(function() {
        startTime = new Date().getTime();

        adapter = new mulberry._Adapter({
          remoteDataUrl : 'foo',
          source : 'bar',
          tableName : tableName,
          fields : fields
        });

        mulberry.app.DeviceStorage.set('bar', null, adapter);

        spyOn(adapter, '_getRemoteData').andCallThrough();
      });

      it("should retrieve remote data when no data is present", function() {
        deferred = adapter.getData();

        deferred.then(function() { resolveTest = true; });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          adapter.getItems().then(function(d) {
            expect(d).toEqual(ajaxMocks.foo);
          });
          expect(adapter._getRemoteData).toHaveBeenCalled();
          expect(adapter._getLastUpdate()).toBeGreaterThan(startTime);
        });
      });

      it("should retrieve local data when it is present and not expired", function() {
        var flag;

        adapter._setLastUpdate();

        // this is a kind of goofy workaround to get DeviceStorage to act
        // as though its database contains old information. the delegated
        // function for k != bar makes sure we can still access the local
        // storage data the adapter needs, because this function is crazy
        // overloaded here
        mulberry.app.DeviceStorage.get = function(k) {
          if (k !== 'bar') {
            return deviceStorageGet.apply(this, arguments);
          }
          var dfd = new dojo.Deferred();
          dfd.resolve(ajaxMocks.foo);
          return dfd;
        };

        waits(10); // just to make startTime > the time triggered above

        runs(function() {
          startTime = new Date().getTime();

          spyOn(mulberry.app.DeviceStorage, 'get').andCallThrough();

          deferred = adapter.getData();

          deferred.then(function() { resolveTest = true; });
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          adapter.getItems().then(function(d) {
            expect(d).toEqual(ajaxMocks.foo);
          });
          expect(adapter._getRemoteData).not.toHaveBeenCalled();
          expect(mulberry.app.DeviceStorage.get).toHaveBeenCalled();
          expect(adapter._getLastUpdate()).toBeLessThan(startTime);

          mulberry.app.DeviceStorage.get = deviceStorageGet;
        });
      });

      it("should retrieve remote data when local data is expired", function() {
        waits(50);    // to make sure we're clear of anything else that could
                      // set the update time

        runs(function() {
          mulberry.app.DeviceStorage.set(adapter.source + "-updated", 100000);

          deferred = adapter.getData();

          deferred.then(function() { resolveTest = true; });
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          adapter.getItems().then(function(d) {
            expect(d).toEqual(ajaxMocks.foo);
          });
          expect(adapter._getRemoteData).toHaveBeenCalled();
          expect(adapter._getLastUpdate()).toBeGreaterThan(startTime);
        });
      });

      it("should reject deferred when xhr fails", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          source : 'foo',
          remoteDataUrl : 'bar',
          tableName : tableName
        });

        deferred = adapter.getData();

        deferred.then(function(d) {
          result = d;
          resolveTest = true;
        }, function(d) {
          result = "REJECTED";
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(result).toEqual("REJECTED");
        });
      });
    });

    describe("_getRemoteData", function() {
      it("should resolve with remote data", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          source : 'bar',
          remoteDataUrl : 'foo',
          tableName : tableName,
          fields : fields
        });

        deferred = adapter._getRemoteData();

        deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(result).toEqual(ajaxMocks.foo);
        });
      });

      it("should resolve false when no url is given", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          source : 'foo',
          tableName : tableName
        });

        deferred = adapter._getRemoteData();

        deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(result).toEqual(false);
        });
      });
    });

    describe("_storeRemoteData", function() {
      it("should store data & resolve the main deferred to true", function() {
        var result = null;

        adapter = new mulberry._Adapter({
          deferred : new dojo.Deferred(),
          tableName : tableName,
          fields : fields
        });

        spyOn(adapter, '_processData').andCallThrough();
        spyOn(adapter, '_store').andCallThrough();

        adapter._storeRemoteData(ajaxMocks.foo);

        adapter.deferred.then(function(d) {
          result = d;
          resolveTest = true;
        });

        waitsFor(function() { return resolveTest; });

        runs(function() {
          expect(adapter._processData).toHaveBeenCalledWith(ajaxMocks.foo);
          expect(adapter._store).toHaveBeenCalledWith(true);
          expect(result).toEqual(true);
        });
      });
    });

  });
});
