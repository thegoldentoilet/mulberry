dojo.provide('mulberry.app.Analytics');


dojo.declare('mulberry.app.Analytics', null, {
  constructor : function(id) {  
    this.appId = id;    
    
    //basic tracking supported by mulberry: page views
    dojo.subscribe('/node/view', this, 'trackPageview');    
  },   

  startTracker: function(accountId) {    
    _gaq.push(['_setAccount', accountId]);
  },

  trackPageview: function(pageUri) {
    console.log("track page view");
    this.setCustomVariables();
    _gaq.push(['_trackPageview', pageUri]);
  },

  trackEvent: function(category, action, label, value) {
    console.log("track event: ", action);
    this.setCustomVariables();
    _gaq.push(['_trackEvent', category, action, label, value]);
  },

  setCustomVariable: function(index, name, value) {
    _gaq.push(['_setCustomVar', index, name, value]);
  },

  setCustomVariables: function() {
    console.log("Setting custom variables: deviceType: " + mulberry.Device.type + ", deviceOs: " + mulberry.Device.os);
    this.setCustomVariable(1, "deviceType", mulberry.Device.type);
    this.setCustomVariable(2, "deviceOs", mulberry.Device.os);
  }
});

