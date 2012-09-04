describe("base _Adapter class", function() {
  var c, C, t, mockjax, ajaxMocks;

  beforeEach(function() {
  	dojo.require('mulberry._Adapter');

    t = dojo.byId('test');

    C = function(config) {
      return new mulberry._Adapter(config || {

      });
    };

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

  });

  // stubbing

});
