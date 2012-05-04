dojo.provide('toura.components.FeedItemDetail');

dojo.require('mulberry.ui.BackgroundImage');
dojo.require('mulberry._Component');
dojo.require('toura.components.VideoPlayer');
dojo.require('dojo.date.locale');
dojo.require('dojo.NodeList-manipulate');

dojo.declare('toura.components.FeedItemDetail', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'FeedItemDetail/FeedItemDetail.haml'),
  widgetsInTemplate: true,
  itemTemplate : Haml(dojo.cache('toura.components', 'FeedItemDetail/Item.haml')),

  mediaHandlers : {
    'video/mp4' : function(item) {
      this.videoPlayer.show();
      this.videoPlayer.set('media', {
        'url' : item.video.url,
        'poster' : item.video.thumbnail
      });
      // don't show an image in the main display
      this.item.image = false;
    },
    'application/x-mpegurl' : function(item) {
      // TODO: determine if there's anything different we need to do here
      this.videoPlayer.show();
      this.videoPlayer.set('media', {
        'url' : item.video.url,
        'poster' : item.video.thumbnail
      });
      // don't show an image in the main display
      this.item.image = false;
    }
  },

  prepareData : function() {
    this.item = this.node;
  },

  setupConnections : function() {
    this.connect(this.externalLink, 'click', function(e) {
      e.preventDefault();
      mulberry.app.PhoneGap.browser.url(this.item.link);
    });
  },

  initializeStrings : function() {
    this.i18n_viewOriginal = this.getString('FEED_VIEW_ORIGINAL');
  },

  _setItemAttr : function(feedItem) {
    if (feedItem.type !== 'feedItem') { return; }

    this.item = feedItem;
    console.log('feedItem', feedItem);

    if (this.item.video && this.item.video.type) {
      dojo.hitch(this, this.mediaHandlers[this.item.video.type])(this.item);
    } else {
      this.videoPlayer.hide();
    }

    dojo.empty(this.content);

    dojo.place(this.itemTemplate(
      dojo.delegate(this.item, {
        pubDate : dojo.date.locale.format(this.item.pubDate),
        i18n_viewOriginal : this.i18n_viewOriginal
      })
    ), this.content);

    dojo[this.item.link ? 'removeClass' : 'addClass'](this.externalLink, 'hidden');

    dojo.attr(this.externalLink, 'href', this.item.link);

    this._prepareImages();
    this._setupLinks();

    if (this.region) {
      this.region.refreshScroller();
    }
  },

  _prepareImages : function() {
    dojo.forEach(this.domNode.querySelectorAll('img'), function(image){
      dojo.query(image)
          .wrap("<div class='replacedImage' dojotype=mulberry.ui.BackgroundImage imageUrl="+image.src+"></div>");

      image.parentNode.removeChild(image);
    }, this);

    dojo.forEach(this.domNode.querySelectorAll('.replacedImage'), function(node){
      var bgImg = new mulberry.ui.BackgroundImage(node);
      console.log(bgImg);
      bgImg.loadImage();
    }, this);
  },

  _setupLinks : function() {
    dojo.forEach(this.domNode.querySelectorAll('.content a'), function(link) {
      dojo.attr(link, 'target', '_blank');
    }, this);
  }
});

