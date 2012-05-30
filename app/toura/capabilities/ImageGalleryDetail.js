dojo.provide('toura.capabilities.ImageGalleryDetail');

dojo.require('mulberry._Capability');
dojo.require('mulberry.app.UI');

dojo.declare('toura.capabilities.ImageGalleryDetail', mulberry._Capability, {
  requirements : {
    imageGallery : 'ImageGallery',
    imageDetail : 'ZoomableImageGallery',
    detailTitle : 'DetailTitle'
  },

  connects : [
    [ 'imageGallery', 'onShowDetail', '_showDetail' ],
    [ 'detailTitle', 'onClose', '_hideDetail' ],
    [ 'imageDetail', 'onImageChange', '_setTitle' ],
    [ 'imageDetail', 'onShowChrome', '_showDetailTitle' ],
    [ 'imageDetail', 'onHideChrome', '_hideDetailTitle' ]
  ],

  _showDetail : function(imageIndex) {
    console.log("in _showDetail");
    mulberry.app.UI.set('siblingNavVisible', false);
    this.detailTitle.hide();
    this.page.showScreen('detail');
    this.imageDetail.set('currentImageIndex', imageIndex);
    this.imageDetail.set('chromeVisible', false);
    console.log("in _showDetail1");
  },

  _hideDetail : function(imageIndex) {
    console.log("in _hideDetail");
    this.page.showScreen('index');
    mulberry.app.UI.set('siblingNavVisible', true);
    this.imageGallery.scrollToIndex(this.imageDetail.currentImageIndex);
    console.log("in _hideDetail1");
  },

  _setTitle : function(image) {
    this.detailTitle.set('screenTitle', image.name);
  },

  _showDetailTitle : function() {
    this.detailTitle.show();
  },

  _hideDetailTitle : function() {
    this.detailTitle.hide();
  }
});
