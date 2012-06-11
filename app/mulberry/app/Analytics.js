dojo.provide('mulberry.app.Analytics');


dojo.declare('mulberry.app.Analytics', null, {
  constructor : function(id) { console.log("in constructor"); },

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