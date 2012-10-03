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

  describe("item manipulation", function() {
    var c;

    beforeEach(function() {
      c = new C(config).placeAt(test);
    });

    it("should insert an item", function() {
      var l, element;

      element = c._addItem({'foo' : 'bar'});

      expect(test.innerHTML.match('bar')).toBeTruthy();

      l = test.children[0].children.length;
      expect(test.children[0].children[l - 1].outerHTML).toBe(element);
    });

    it("should insert an item at an index", function() {
      var items = [
        {'foo' : 'bar'},
        {'foo' : 'baz'},
        {'foo' : 'biz'}
      ], i, element;

      for (i = items.length - 1; i >= 0; i--) {
        c._addItem(items[i]);
      };

      element = c._addItem({'foo' : 'boz'}, 1);

      expect(test.children[0].children[1].outerHTML).toBe(element);
    });
  });

  it("should populate the component based on a store", function() {
    var c = new C(config).placeAt(test), results;

    results = store.query();

    c.setStore(results);

    expect(c.storeData.length).toEqual(mockdata.length);
    expect(test.innerHTML.match('buzz')).toBeTruthy();
  });

  // this is basically testing dojo.store, but whatever...
  it("should populate the component based on a query", function() {
    var c = new C(config).placeAt(test), results;

    results = store.query({'spam' : 'eggs'});

    c.setStore(results);

    expect(test.innerHTML.match('bor')).toBeFalsy();
    expect(test.innerHTML.match('buzz')).toBeTruthy();
  });
});
