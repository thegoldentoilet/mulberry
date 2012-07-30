dojo.provide('toura.Analytics');
dojo.require('mulberry.app.Analytics');
/**
 * listens for the broadcast of application events
 * and tracks them in analytics as appropriate.
 */


dojo.declare('toura.Analytics', mulberry.app.Analytics, {
  
  /**
   * @constructor
   * @param {String} id  The application ID to associate with analytics data
   *
   * Subscribes to various application events.
   */
  constructor : function(id) {
    //this.inherited(arguments);
    dojo.subscribe('/video/play', dojo.hitch(this, 'trackEvent', 'Video', 'Play'));
    dojo.subscribe('/audio/play', dojo.hitch(this, 'trackEvent', 'Audio', 'Play'));
    dojo.subscribe('/image/view', dojo.hitch(this, 'trackEvent', 'Image', 'View'));
    dojo.subscribe('/feed/view',  dojo.hitch(this, 'trackEvent', 'Feed', 'View'));
    dojo.subscribe('/share', dojo.hitch(this, 'trackEvent', 'Share'));
    dojo.subscribe('/search', this, 'trackSearch');
  },

  trackSearch : function(term) {
    term = term ? dojo.trim(term) : false;
    if (!term) { return; }
    this.trackPageview('/search?q=' + encodeURIComponent(term));
  }
});

(function(){
toura.Analytics = new toura.Analytics();

dojo.subscribe('/app/ready', function() {
  var gaConfig = mulberry.app.Config.get('googleAnalytics');
  
  if (gaConfig) {
    toura.Analytics.startTracker(gaConfig.trackingId);
  }
});

}());
