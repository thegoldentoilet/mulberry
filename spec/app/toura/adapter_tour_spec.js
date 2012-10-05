describe('toura.adapters.Tour', function() {
  var t, mockjax, deviceStorageInit = false, tableName = 'adapterTourTest';

  beforeEach(function() {
    dojo.require('toura.adapters.Tour');
    dojo.require('mulberry.app.DeviceStorage');
    mulberry.app.DeviceStorage.drop();
    mulberry.app.DeviceStorage.init('foo');

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
          dfd.resolve(networkIsReachable);
          return dfd;
        }
      }
    };

    dojo.xhrGet = dojo.io.script.get = mockjax;
    appMajorVersion = mulberry.app.Config.get('appVersion').split('.')[0] * 1;

    toura.data.local.version = 1;

    newerRemoteData = dojo.mixin({}, toura.data.local);
    newerRemoteData.appVersion = appMajorVersion + ".0";
    newerRemoteData.version = toura.data.local.version + 2;
    newerRemoteData.items = [ { id : 'new remote' } ];

    ajaxMocks = {
      'bundle' : toura.data.local,
      'remote' : newerRemoteData,
      'version' : { version : newerRemoteData.version, appVersion: appMajorVersion + ".0" }
    };

    config = {
      bundleDataUrl : 'bundle',
      remoteDataUrl : 'remote',
      remoteVersionUrl : 'version',
      storageKey : 'key',
      tableName : tableName
    };

    networkIsReachable = true;

    t = new toura.adapters.Tour(config);
    mulberry.app.DeviceStorage.set(t.source, null, t);
  });

  describe("getItems", function() {
    it("should return a promise", function() {
      var flag, bootstrap;

      bootstrap = t.getData();

      bootstrap.then(function() { flag = true; });

      waitsFor(function() { return flag; });

      runs(function() {
         expect(t.getItems().then).toBeDefined();
      });
    });
  });

  describe("getRootNodes", function() {
    it("should get the children of the home node", function() {
      var flag, bootstrap;

      bootstrap = t.getData();

      bootstrap.then(function() { flag = true; });

      waitsFor(function() { return flag; });

      runs(function() {
        expect(t.getRootNodes()).toEqual(toura.Data.getModel('node-home').children);
      });
    });
  });
});
