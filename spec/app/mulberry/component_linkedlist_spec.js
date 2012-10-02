describe("linked list component", function() {
  var store, mockdata,
      test, C, config;

  beforeEach(function() {
    dojo.require('mulberry.app.UI');
    dojo.require('mulberry.components._LinkedList');
    dojo.require('dojo.store.Memory');
    dojo.require('dojo.store.Observable');

    mockdata = [
      {'foo' : 'bar', 'spam' : 'eggs' },
      {'foo' : 'baz', 'spam' : 'bacon' },
      {'foo' : 'buzz', 'spam' : 'eggs' },
      {'foo' : 'biz', 'spam' : 'eggs' },
      {'foo' : 'bor', 'spam' : 'bacon' }
    ];

    store = dojo.store.Observable(new dojo.store.Memory({
      data : mockdata
    }));

    C = mulberry.components._LinkedList;

    test = dojo.byId('test');
    dojo.empty(test);

    mulberry.app.UI.hasTouch = false;

    config = {
      templateString : '%ul',
      itemTemplate : Haml('%li =foo')
    };
  });

  it("should populate the component based on a store", function() {
    var c = new C(config).placeAt(test), results;

    results = store.query();

    c.setStore(results);

    expect(c.storeData.length).toEqual(mockdata.length);
    expect(test.innerHTML.match('buzz')).toBeTruthy();
  });
});
