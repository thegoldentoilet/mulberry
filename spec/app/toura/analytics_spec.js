describe("analytics", function() {
  // Google Analytics global object
  _gaq = [];

  beforeEach(function() {
    dojo.require('toura.Analytics');
  });

  it("should track favorites", function() {
    spyOn(_gaq, 'push');
    dojo.publish('/favorite/add', ['/fake-url']);
    expect(_gaq).not.toBeNull();
    expect(_gaq.push).toHaveBeenCalledWith([ '_trackEvent', 'Favorite', 'Add', '/fake-url', undefined ] );
  });

});

