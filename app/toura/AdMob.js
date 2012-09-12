dojo.provide('toura.AdMob');

/**
 * 
 */

dojo.declare('toura.AdMob', null, {

  /**
   * @constructor
   * @param {String} id  The site ID to associate with publisher id
   *
   * Subscribes to various application events.
   */
  constructor : function(id) {
    //can do pub/sub type stuff in here if needed
  },
  loadBanner : function(id,x,y,h,w,lat,lon) {
    window.plugins.adMob.createBanner(id);
    window.plugins.adMob.loadBanner(id,x,y,h,w,lat,lon);
    window.plugins.adMob.moveBanner(id, 0, 430);
  },
  destroy : function () {
    console.log("in AdMob Destroy");
    window.plugins.adMob.deleteBanner();
  }
});


