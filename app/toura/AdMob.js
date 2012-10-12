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
  constructor : function (id) {
    //can do pub/sub type stuff in here if needed
    //need to listen for orientation change
  },

  /**
   * @loadBanner
   * @param {String} id  The site ID to associate with publisher id
   * @param {String} deviceType Type of device - phone or tablet
   * @param {int} x   The x position value for the banner to display
   * @param {int} y   The y position value for the banner to display
   * @param {int} h   The height of the banner
   * @param {int} w   The width of the banner
   * @param {int} lat The latitude of the location of the device
   * @param {int} lon The longitude of the location of the device
   *
   * Calls the phonegap plugin to create, load, and then move the banner into place.
   */
  loadBanner : function (id, deviceType) {
    window.plugins.adMob.createBanner(id, deviceType);
    window.plugins.adMob.moveBanner(id, deviceType, 0, 430); // these values need to be dynamic based on device?
  },

  /**
   * @destroy
   *
   * Deletes banner ad in native code
   */
  destroy : function () {
    window.plugins.adMob.deleteBanner();
  }
});


