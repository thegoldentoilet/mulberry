
describe('toura.models.ExternalContent', function() {
  var t, mockdata, mockstore, mocknode;

  beforeEach(function() {
    dojo.require('toura.models.ExternalContent');
    mulberry.app.DeviceStorage.drop();

    mockdata = [{
      'foo' : 'foofaraw',
      'bar' : 'barfaraw'
    }];

    mocknode = {
      addExternalChildren : function(d) {}
    };

    dojo.provide('toura.adapters');

    // note: we add this to toura.adapters because it's where
    // the model looks for it by default
    dojo.declare('toura.adapters.mockdapter', null, {
      constructor : function(config) {
        dojo.mixin(this, config);
      },

      getData : function() {
        var dfd = new dojo.Deferred();

        dfd.resolve(mockdata);

        return dfd.promise;
      }
    });

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

  it("should correctly set up the adapter", function() {
    var foo = new toura.adapters.mockdapter({
      remoteDataUrl : 'sourceUrl-foo',
      source : 'name-foo'
    });
    expect(t.adapter).toEqual(foo);
  });

  it("should add children to a node", function() {
    spyOn(mocknode, 'addExternalChildren');

    t.load(mocknode);

    expect(mocknode.addExternalChildren).toHaveBeenCalledWith(mockdata);
  });
});
