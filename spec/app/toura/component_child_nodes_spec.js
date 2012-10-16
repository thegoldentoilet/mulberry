describe("child node component", function() {
  var c, config, test, node, childList,
      populateNode = function(node, children) {
        var i = 0, l = children.length;

        for(i = 0; i < l; ++i) {
          node.children.put(children[i]);
        }
      };

  beforeEach(function() {
    dojo.require('toura.components.ChildNodes');
    dojo.require('dojo.store.Memory');
    dojo.require('dojo.store.Observable');

    if (c) { c.destroy(); }

    test = dojo.byId('test');

    node = {
      children : dojo.store.Observable(new dojo.store.Memory({}))
    };

    config = {
      'node' : node
    };

    childList = [
      {'id' : 'foo', 'name' : 'bar', 'href' : '#bar'},
      {'id' : 'spam', 'name' : 'eggs', 'href' : "#eggs"}
    ];
  });

  it("should create a child node component", function() {
    c = new toura.components.ChildNodes(config).placeAt(test);
    expect(test.querySelector(getRootSelector(c))).toBeTruthy();
  });

  it("should contain an item for each child node on the main node", function() {
    populateNode(node, childList);

    c = new toura.components.ChildNodes(config).placeAt(test);
    expect(test.querySelector(getRootSelector(c)).children.length).toBe(2);
  });
});
