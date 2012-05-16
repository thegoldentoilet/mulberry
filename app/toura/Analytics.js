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

    dojo.subscribe('/video/play', dojo.hitch(this, '_trackEvent', 'Video Play'));
    dojo.subscribe('/audio/play', dojo.hitch(this, '_trackEvent', 'Audio Play'));
    dojo.subscribe('/image/view', dojo.hitch(this, '_trackEvent', 'Image View'));
    dojo.subscribe('/share', dojo.hitch(this, '_trackEvent', 'Share'));

    dojo.subscribe('/node/view', this, '_trackPageview');
    dojo.subscribe('/search', this, '_trackSearch');
  },

  /**
   * @param {String} eventType  The type of event to track
   * @param {Object} data  The data associated with the event
   *
   * Receives data associated with an application event, and sends the data
   * to the analytics service.
   */
  _trackEvent : function(eventType, data) {
    // analytics.log(eventType, { data : data });
  },

  /**
   * @param {String} hash  The hash for the pageview
   */
  _trackPageview : function(hash) {
    // analytics.log('/tour/' + mulberry.app.Config.get('app').id + hash);
    console.log("tracking page view: " + hash)
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
    // analytics.log('Search', { searchTerm : term });
  }
});

toura.Analytics = new toura.Analytics();

dojo.subscribe('/app/ready', function() {
  var analytics = mulberry.app.PhoneGap.analytics;
  analytics.startTracker('UA-31816441-1');
  analytics.setCustomVariable(1, "deviceType", mulberry.Device.type, 1);
  analytics.setCustomVariable(2, "deviceOs", mulberry.Device.os, 1);
});

}());
