dojo.provide('toura.UI');

dojo.require('dojo.Stateful');

dojo.require('toura.components.SiblingNav');
dojo.require('toura.components.AdTag');
dojo.require('toura.AdMob');

(function(m) {

var adsClass = 'has-ads',
    // used to nudge the page up depending on state of sibling nav
    siblingNavClass = 'has-sibling-nav',
    siblingNavOpenClass = 'sibling-nav-open';

dojo.declare('toura.UI', dojo.Stateful, {
  constructor : function() {
    this.body = dojo.body();
    this.appConfig = mulberry.app.Config.get('app');

    this._setupFeatureClasses();
    this._setupSiblingNav();

    this._queuedAdTag = false;
    dojo.subscribe('/page/transition/end', this, this._renderQueuedAdTag);

    dojo.connect(m.app.UI, 'showPage', this, '_onShowPage');
    dojo.connect(this.siblingNav, 'show', this, '_onShowSiblingNav');
    dojo.connect(this.siblingNav, 'hide', this, '_onHideSiblingNav');
  },

  _onShowPage : function(page, node) {
    if (this.siblingNav) {
      this.siblingNav.set('node', node);
    }

    this._setupAds();
  },

  _setupFeatureClasses : function() {
    dojo.forIn(toura.features, function(feature, enabled) {
      if (!enabled) { return; }
      dojo.addClass(this.body, 'feature-' + feature);
    }, this);
  },

  _setupSiblingNav : function() {
    // don't display sibling nav for certain cases
    if (!toura.features.siblingNav) { return; }
    if (mulberry.Device.environment === 'browser' && mulberry.Device.os === 'ios' && !mulberry.Device.standalone) { return; }
    if (toura.features.ads && this.appConfig.ads && this.appConfig.ads[m.Device.type]) { return; }

    this.siblingNav = m.app.UI.addPersistentComponent(toura.components.SiblingNav, {}, 'first');

    // add/remove nudge classes when sibling nav opens/closes
    dojo.connect(this.siblingNav, 'open', this, function() {
      dojo.addClass(dojo.body(), siblingNavOpenClass);
      dojo.publish('/window/resize');
    });

    dojo.connect(this.siblingNav, 'close', this, function() {
      dojo.removeClass(dojo.body(), siblingNavOpenClass);
      dojo.publish('/window/resize');
    });
  },

  _onShowSiblingNav : function (argument) {
    dojo.addClass(dojo.body(), siblingNavClass);
  },

  _onHideSiblingNav :  function(argument) {
    dojo.removeClass(dojo.body(), siblingNavClass);
  },

  _renderQueuedAdTag : function() {
    if (this._queuedAdTag && dojo.isFunction(this._queuedAdTag)) {
      this._queuedAdTag();
      this._queuedAdTag = false;
    }
  },

  _setupAdTag : function () {
    var currentPage = m.app.UI.currentPage;

    if (this.adTag) {
      this.adTag.destroy();
    }

    this._queuedAdTag = dojo.hitch(this, function () {
      if (this.appConfig.ads && this.appConfig.ads[m.Device.type]) {
        if (currentPage) {
          currentPage.addClass(adsClass);
        }

        this.adTag = m.app.UI.addPersistentComponent(
          toura.components.AdTag,
          { adConfig : this.appConfig.ads[m.Device.type] },
          'last'
        );

        //this.adTag.startup();
      }
    });
  },

  _setupAds : function () {
    var isHomeNode = m.app.UI.currentPage && m.app.UI.currentPage.baseObj.isHomeNode;
    
    if (!toura.features.ads) { return; }
    
    if (isHomeNode) {
      if (this.AdMobAd) {
          // need to destroy and delete existing ad
          this.AdMobAd.destroy();
          this.AdMobAd = null;
      }
      return;
    }

    mulberry.app.PhoneGap.network.isReachable().then(dojo.hitch(this, function (isReachable) {
      if (!isReachable) { return; }
      // this is for testing only:
      // adMobId = 'a15050ddd2ed539';
      // adMobId = 'a15023ce3c0593c';
      
      if (this.appConfig.ad_mob && this.appConfig.ad_mob.publisher_id && mulberry.app.PhoneGap.present) {
        if (this.AdMobAd) {
          // need to destroy and delete existing ad
          this.AdMobAd.destroy();
          this.AdMobAd = null;
        }
        // perhaps need to set up default ad properties? not sure.
        this.AdMobAd = new toura.AdMob(this.appConfig.ad_mob.publisher_id);
        
        this.AdMobAd.loadBanner(this.appConfig.ad_mob.publisher_id, mulberry.Device.type);
      } else {
        this._setupAdTag();
      }
  }));

  }

});

dojo.subscribe('/ui/ready', function() {
  toura.UI = new toura.UI();
});

}(mulberry));
