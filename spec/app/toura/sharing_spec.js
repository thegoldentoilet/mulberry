describe("sharing API", function() {
  var api, data, ds, node, id = 'node-image_gallery';
  

  beforeEach(function() {
    dojo.require('toura.Sharing');
    dojo.require('mulberry.app.DeviceStorage');
    dojo.require('toura.Data');
    //dojo.require('toura.user.Facebook.base');

    mulberry.app.Config.set('app', toura.data.local);
    app = mulberry.app.Config.get('app');
    //FB = new toura.user.Facebook.base();

    if (!ds) {
      ds = mulberry.app.DeviceStorage;
      ds.init(mulberry.app.Config.get('id'));
    }

    node = dataAPI.getModel(id);
    node.sharingText = 'Sharing text is crazy!';
    node.sharingURL = 'http://www.cnn.com';
    app.sharingText = 'Universal Sharing Text';
    app.sharingUrl = 'http://www.toura.com';
  });

  describe("toura sharing", function() {
    it("should return node sharing text", function() {
      var ret = toura.Sharing.getMessage('facebook', node);
      expect(node.sharingText).toBeDefined();
      expect(node.sharingURL).toBeDefined();
      console.log(ret);
      expect(ret).toBe(node.sharingText + ' ' + node.sharingURL);
    });

    it("should return app level sharing text", function() {
     
      node.sharingText = null;
      node.sharingURL = null;
      var ret = toura.Sharing.getMessage('facebook', node);
      expect(app.sharingText).toBeDefined();
      expect(app.sharingUrl).toBeDefined();
      console.log(ret);
      expect(ret).toBe(app.sharingText + ' ' + app.sharingUrl);
    });

    //commented out until sharing in mobile web works.
    /*it("should share on click", function() {
      var params = dojo.mixin({
        messageText : 'Sharing text!'
        }, FB);

      toura.Sharing.share(FB, params, node)
        .then(
          // sharing was successful
          function() {
            expect(true).toBeDefined();
            return;
          },
          // sharing failed
          function(msg) {
            expect(msg).toBeDefined();
          }
        );
    });*/
  });
});
