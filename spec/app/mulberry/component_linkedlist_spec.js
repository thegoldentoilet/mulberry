describe("linked list component", function() {
  var store, mockdata;

  beforeEach(function() {
    dojo.require('mulberry.component._LinkedList');
    dojo.require('dojo.store.Memory');
    dojo.require('dojo.store.Observable');

    mockdata = [
      {'foo' : 'bar', 'spam' : 'eggs' },
      {'foo' : 'baz', 'spam' : 'bacon' },
      {'foo' : 'buzz', 'spam' : 'eggs' }
    ];

    store = dojo.store.Observable(new dojo.store.Memory({
      data : mockdata
    }));
  });
});
