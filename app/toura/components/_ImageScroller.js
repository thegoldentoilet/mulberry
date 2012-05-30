dojo.provide('toura.components._ImageScroller');

dojo.require('vendor.iscroll');
dojo.require('toura.components._ImageGallery');

/**
 * This is a mixin to be used with components that include
 * an image scroller. It should not be used on its own.
 */
dojo.declare('toura.components._ImageScroller', toura.components._ImageGallery, {
  templateString : dojo.cache('toura.components', '_ImageScroller/ImageScroller.haml'),

  postMixInProperties : function() {
    this.inherited(arguments);
    this.useScroller = this.images.length > 1;
  },

  startup : function() {
    this.inherited(arguments);
    if (this.useScroller) {
      this._setupImageScroller();
    } else {
      this.set('currentImageIndex', 0);
    }
  },

  _setupImageScroller : function() {
    if (this.useScroller && this.scrollerNode) {

      var self = this,
          node = this.scrollerNode.parentNode,
          scroller;

      scroller = this.scrollerHandle = new iScroll(node, {
        snap : true,
        momentum : false,
        hScrollbar : false,
        onScrollEnd : function() {
          self.set('currentImageIndex', this.currPageX);
          self.onScrollEnd(this.currPageX);
        }
      });

      scroller.refresh();
      this.onScrollerSetupComplete();
    }

    this.set('currentImageIndex', 0);
  },

  onScrollerSetupComplete : function() {
    console.log('toura.components._ImageScroller::onScrollerSetupComplete()');
    // stub for connections
  },

  onScrollEnd : function(imageIndex) {
    // stub for connection
  },

  _setWidth : function() {
    var self = this;
    setTimeout(function() {
      var regionWidth = self.region.innerWidth(),
        scrollerWidth = self.images.length * regionWidth;

    console.log("in imageScroller_setWidth() region scroller: ", regionWidth + ' ' + scrollerWidth);
    self.scrollerNode.style.width = scrollerWidth + 'px';
    self.query('.image').style('width', regionWidth + 'px');
    if (!self.scrollerHandle) { return; }
    self.scrollerHandle.refresh();
    self.scrollToIndex(self.currentImageIndex);
  },20);
  },

  _setCurrentImageIndexAttr : function(imageIndex) {
    var childNodes = this.indicator.childNodes;
    this.inherited(arguments);
    dojo.forEach(childNodes, function(child) {
      dojo.removeClass(child, 'active');
    });
    if (childNodes.length > 0) {
      dojo.addClass(childNodes[imageIndex], 'active');
    }
  },

  postCreate : function() {
    this.inherited(arguments);

    // hide the dots if there's only one
    if (this.images.length <= 1) {
      this.hide(this.indicator);
    }
  },

  _updateIndicator : function() {
  },

  scrollToIndex : function(imageIndex) {
    if (!this.scrollerHandle) { return; }
    if (imageIndex === this.currentImageIndex) { return; }
    this.scrollerHandle.scrollToPage(imageIndex, 0, '0ms');
    this.set('currentImageIndex', imageIndex);
  },

  refresh : function() {
    if (!this.scrollerHandle) { return; }
    this.scrollerHandle.refresh();
  },

  destroy : function() {
    if (this.scrollerHandle) { this.scrollerHandle.destroy(); }
    this.inherited(arguments);
  }
});
