describe("child node grid component", function() {
  var pg, t, C, config, nodes, c, node;

  beforeEach(function() {
    dojo.require('mulberry.app.UI');
    dojo.require('mulberry.app.Config');
    dojo.require('mulberry.app.PhoneGap');
    dojo.require('toura.components.ChildNodeGrid');
    dojo.require('mulberry.ui.BackgroundImage');
    dojo.require('dojo.store.Memory');
    dojo.require('dojo.store.Observable');

    nodes = [];

    if (!pg) {
      dojo.publish('/app/start');
      pg = true;
    }

    mulberry.app.UI = {
      supportsCssBackgroundContain : function() { return true; },
      viewport : {
        width : 100,
        height : 100
      }
    };

    if (c) { c.destroy(); }
    C = toura.components.ChildNodeGrid;
    t = dojo.byId('test');

    node = {
      children : dojo.store.Observable(new dojo.store.Memory()),
      populateChildren : function() {}
    };
  });

  it("should create a child node grid component", function() {
    var c = new C({ node : node }).placeAt(t);
    expect(t.querySelector(getRootSelector(c))).toBeTruthy();
  });

  it("should not set the grid size on phone because there's only one size", function() {
    var c = new C({ node : node, device : { type : 'phone', os : 'fake' } }).placeAt(t);

    var elmt = t.querySelector(getRootSelector(c));
    expect(/small|medium|large/.test(elmt.className)).toBeFalsy();
  });

  it("should set the grid size to large on tablet for less than 12 items", function() {
    var mockChildren = makeMockNodes(11, { featuredImage : { small : {}, large : {} } }),
        c, i, l = mockChildren.length;

    for(i = 0; i < l; ++i) {
      node.children.put(mockChildren[i]);
    }

    c = new C({
      node : node,
      device : { type : 'tablet', os : 'fake' }
    }).placeAt(t);

    expect(dojo.hasClass(c.domNode, 'size-large')).toBeTruthy();
  });

  it("should set the grid size to medium on tablet for less than 24 items", function() {
    var mockChildren = makeMockNodes(23, { featuredImage : { small : {}, large : {} } }),
        c, i, l = mockChildren.length;

    for(i = 0; i < l; ++i) {
      node.children.put(mockChildren[i]);
    }

    c = new C({
      node : node,
      device : { type : 'tablet', os : 'fake' }
    }).placeAt(t);

    expect(dojo.hasClass(c.domNode, 'size-medium')).toBeTruthy();
  });

  describe("device-specific css", function() {
    beforeEach(function() {
      dojo.destroy(dojo.byId('component-css-child-node-grid'));
      toura.components.ChildNodeGrid.placedCSS = false;
    });

    it("should add the android-specific css to the page", function() {
      mulberry.app.UI = {
        viewport : {
          width : 100,
          height : 100
        }
      };

      var c = new C({
        node : node,
        device : { type : 'phone', os : 'android' }
      });

      expect(dojo.byId('component-css-child-node-grid')).toBeTruthy();
    });

    it("should not insert child node grid component css for ios", function() {
      var c = new C({
        node : node,
        device : { type : 'phone', os : 'ios' }
      });

      expect(dojo.byId('component-css-child-node-grid')).toBeFalsy();
    });
  });
});
