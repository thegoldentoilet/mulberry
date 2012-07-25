describe("sharing API", function() {
  var api, data, ds, node, id = 'node-image_gallery';
  

  beforeEach(function() {
    dojo.require('toura.Sharing');
    dojo.require('mulberry.app.DeviceStorage');
    dojo.require('toura.Data');

    mulberry.app.Config.set('app', toura.data.local);
    app = mulberry.app.Config.get('app');

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
    it("should return node sharing text if it's set for the node", function() {
      var ret = toura.Sharing.getMessage('facebook', node);
      expect(node.sharingText).toBeDefined();
      expect(node.sharingURL).toBeDefined();
      expect(ret).toBe(node.sharingText + ' ' + node.sharingURL);
    });

    it("should return app sharing text if node sharing text isn't set", function() {
     
      node.sharingText = null;
      node.sharingURL = null;
      var ret = toura.Sharing.getMessage('facebook', node);
      expect(app.sharingText).toBeDefined();
      expect(app.sharingUrl).toBeDefined();
      expect(ret).toBe(app.sharingText + ' ' + app.sharingUrl);
    });
  });
});