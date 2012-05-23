dojo.provide('toura.Analytics');

/**
 * listens for the broadcast of application events
 * and tracks them in analytics as appropriate.
 */
(function(){

dojo.declare('toura.Analytics', null, {
  /**
   * @constructor
   * @param {String} id  The application ID to associate with analytics data
   *
   * Subscribes to various application events.
   */
  constructor : function(id) {
    this.appId = id;

    dojo.subscribe('/video/play', dojo.hitch(this, '_trackEvent', 'Video', 'Play'));
    dojo.subscribe('/audio/play', dojo.hitch(this, '_trackEvent', 'Audio', 'Play'));
    dojo.subscribe('/image/view', dojo.hitch(this, '_trackEvent', 'Image', 'View'));
    dojo.subscribe('/share', dojo.hitch(this, '_trackEvent', 'Share'));

    dojo.subscribe('/node/view', this, '_trackPageview');
    dojo.subscribe('/search', this, '_trackSearch');
  },

  /**
   * @param {String} category The name you supply for the group of objects you
   *   want to track.
   * @param {String} action A string that is uniquely paired with each
   *   category, and commonly used to define the type of user interaction for
   *   the web object.
   * @param {String} [label] An optional string to provide additional
   *   dimensions to the event data.
   * @param {String} [value] An integer that you can use to provide numerical
   *   data about the user event.
   *
   * Receives data associated with an application event, and sends the data
   * to the analytics service.
   */
  _trackEvent : function(category, action, label, value) {
    console.log("tracking event: " + Array.prototype.join.call(arguments, ','));
    mulberry.app.PhoneGap.analytics.trackEvent(category, action, label, value);
  },

  /**
   * @param {String} hash  The hash for the pageview
   */
  _trackPageview : function(hash) {
    // analytics.log('/tour/' + mulberry.app.Config.get('app').id + hash);
    console.log("tracking page view: " + hash);
    mulberry.app.PhoneGap.analytics.trackPageview(hash);
  },

  /**
   * @param {String} term
   *
   * Handles tracking searches
   */
  _trackSearch : function(term) {
    term = term ? dojo.trim(term) : false;
    if (!term) { return; }
    console.log("tracking search term: " + term);
    mulberry.app.PhoneGap.analytics.trackPageview('/search?q=' + encodeURIComponent(term));
  }
});

toura.Analytics = new toura.Analytics();

dojo.subscribe('/app/ready', function() {
  var gaConfig = mulberry.app.Config.get('googleAnalytics');
  if (gaConfig) {
    mulberry.app.PhoneGap.analytics.startTracker(gaConfig.trackingId);
  }
});

}());
