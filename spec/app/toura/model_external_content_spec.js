
describe('toura.models.ExternalContent', function() {
  var t, mockdata, mockstore;

  beforeEach(function() {
    dojo.require('toura.models.ExternalContent');
    mulberry.app.DeviceStorage.drop();

    mockdata = [{
      'foo' : 'bar'
    }];

    dojo.provide('toura.adapters');

    toura.adapters.mockdapter = (function() {
      var mockdapter = function(config) {
        dojo.mixin(this, config);
      };

      mockdapter.getData = function() {
        var dfd = new dojo.Deferred();

        dfd.resolve(mockdata);

        return dfd.promise;
      };

      return mockdapter;
    })();

    mockstore = {
      getValue : function(item, value) {
        switch (value) {
          case 'id':
            return 'id-foo';
          case 'name':
            return 'name-foo';
          case 'sourceUrl':
            return 'sourceUrl-foo';
          case 'adapter':
            return 'mockdapter';
        }
      }
    };

    t = new toura.models.ExternalContent(mockstore);
  });

  it("should fetch and mixin values from the store", function() {
    expect(t.id).toEqual('id-foo');
    expect(t.name).toEqual('name-foo');
    expect(t.sourceUrl).toEqual('sourceUrl-foo');
  });
});
