dojo.provide('mulberry.app.Analytics');


dojo.declare('mulberry.app.Analytics', null, {
  constructor : function(id) {  
    this.appId = id;    
    dojo.subscribe('/video/play', dojo.hitch(this, 'trackEvent', 'Video', 'Play'));
    dojo.subscribe('/audio/play', dojo.hitch(this, 'trackEvent', 'Audio', 'Play'));
    dojo.subscribe('/image/view', dojo.hitch(this, 'trackEvent', 'Image', 'View'));
    dojo.subscribe('/share', dojo.hitch(this, 'trackEvent', 'Share'));
    dojo.subscribe('/node/view', this, 'trackPageview');
    dojo.subscribe('/search', this, 'trackSearch');
  },

   trackSearch : function(term) {
    term = term ? dojo.trim(term) : false;
    if (!term) { return; }
    console.log("tracking search term: " + term);
    this.trackPageview('/search?q=' + encodeURIComponent(term));
  },

  startTracker: function(accountId) {
    console.log("starting tracker");
    //_gaq.push(['_setAccount', accountId]);
  },

  trackPageview: function(pageUri) {
    console.log("trackpageview tracker");
    this.setCustomVariables();
    //_gaq.push(['_trackPageview', pageUri]);
  },

  trackEvent: function(category, action, label, value) {
    console.log("trackevent tracker");
    this.setCustomVariables();
    //_gaq.push(['_trackEvent', category, action, label, value]);
  },

  setCustomVariable: function(index, name, value) {
    //_gaq.push(['_setCustomVar', index, name, value]);
  },

  setCustomVariables: function() {
    console.log("Setting custom variables: deviceType: " + mulberry.Device.type + ", deviceOs: " + mulberry.Device.os);
    this.setCustomVariable(1, "deviceType", mulberry.Device.type);
    this.setCustomVariable(2, "deviceOs", mulberry.Device.os);
  }
});

(function(){
mulberry.Analytics = new mulberry.app.Analytics();

dojo.subscribe('/app/ready', function() {
  var gaConfig = mulberry.app.Config.get('googleAnalytics');
  
  if (gaConfig) {
    mulberry.Analytics.startTracker(gaConfig.trackingId);
  }
});

}());