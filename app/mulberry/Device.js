dojo.provide('mulberry.Device');

dojo.require('mulberry.Utilities');
dojo.require('mulberry.app.Config');

mulberry._loadDeviceConfig = function() {
  var browserDevices = {
    'ios' : {
      re : /(iPhone|iPod|iPad)/,
      version: function(ua) {
        var vnum = parseFloat(ua.match(/([\d_]+) like Mac OS X/)[1].replace('_', '.'));
        if (!vnum) { return 1; }    // I am hoping this is right?
        return vnum;
      }
    },
    'android' : {
      re : /(Android)/,
      version: function(ua) {
        return parseFloat(ua.match(/Android ([\d\.]+)/)[1]);
      }
    }
  }, ua;
  
  
  function getDeviceType() {
    var body = dojo.body(),
        minDim = Math.min(body.offsetWidth, body.offsetHeight);

    return minDim > 640 ? 'tablet' : 'phone';
  }

  mulberry.Device = mulberry.app.Config.get('device') || {
    type : getDeviceType(),
    os : 'browser',
    standalone: !!navigator.standalone
  };
  
  if (mulberry.Device.os === 'browser') {
    ua = window.navigator.userAgent;
        
    dojo.forIn(browserDevices, function(k, v) {
      if (ua.search(v.re) > -1) { mulberry.Device.browserOS = k; }
    });
    
    if (mulberry.Device.browserOS) {
      mulberry.Device.browserVersion = browserDevices[mulberry.Device.browserOS].version(ua);
    }
  }

};

mulberry._loadDeviceConfig();
