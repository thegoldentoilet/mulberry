dojo.provide('toura.models.Image');

dojo.require('toura.models._CaptionedAsset');
dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.Image', [ toura.models._CaptionedAsset, toura.models._StorableAsset ], {
  constructor : function(store, item) {
    var subItem = store.get(item.image._reference);
     
    dojo.mixin(this, {
      id : subItem.id,
      name : subItem.name,
      height : subItem.height || null,
      width : subItem.width || null
    });
    this._getUrl(store, subItem);
    this._processCaption(store, item);
  }
});


