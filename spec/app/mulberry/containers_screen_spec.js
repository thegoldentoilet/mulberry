describe("containers screen", function() {
  var c, C, t, flag;

  beforeEach(function() {
    dojo.require('mulberry.containers.Screen');
    dojo.require('mulberry._Component');

    if (c) { c.destroy(); }
    C = function(config) {
      return new mulberry.containers.Screen(config || {}).placeAt(t);
    };

    t = dojo.byId('test');
  });

  it("should create a screen on the page", function() {
    c = C({ config : {} });
    expect(t.querySelector(getRootSelector(c))).toBeTruthy();
  });

  it("should create regions if they are specified", function() {
    var spy = spyOn(mulberry.containers, 'Region').andCallThrough();

    c = C({
      config : {
        regions : [
          { scrollable : true },
          { scrollable : true },
          { scrollable : true }
        ]
      },
      baseObj : 'fake node',
      device : 'fake device'
    });

    expect(spy.callCount).toBe(3);

    var regionArgs = spy.mostRecentCall.args[0];

    expect(regionArgs.config).toEqual({ scrollable: true});
    expect(regionArgs.baseObj).toBe('fake node');
    expect(regionArgs.device).toBe('fake device');
    expect(regionArgs.screen).toBe(c);
  });
  
  it("should correctly select a component attached to it", function() {
    dojo.provide('my.Component');
    
    dojo.declare('my.Component', mulberry._Component, {
      templateString : "<div></div>"
    });

    var componentA = new my.Component(),
        componentB = new my.Component();
    
    cA = C({ config: {} });
    cB = C({ config: {} });
    
    cA.registerComponent(componentA);
    cB.registerComponent(componentB);
    
    expect(cA.getComponent('Component')).toBe(componentA);
    expect(cB.getComponent('Component')).toBe(componentB);
  });

});
