dojo.provide('toura.models.GoogleMapPin');

dojo.require('toura.models._CaptionedAsset');

dojo.declare('toura.models.GoogleMapPin', toura.models._CaptionedAsset, {
  constructor : function(store, item) {
    var subItem = store.get(item.googleMapPin._reference);
     
    dojo.mixin(this, {
      id : subItem.id,
      name : subItem.name,
      lat : subItem.lat,
      lon : subItem.lon,
      address : subItem.address,
      phoneNumber : subItem.phoneNumber,
      website : subItem.website
    });
    this._processCaption(store, item);
  }
});
