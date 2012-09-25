dojo.provide('toura.models.Audio');

dojo.require('toura.models._CaptionedAsset');
dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.Audio', [ toura.models._CaptionedAsset, toura.models._StorableAsset ], {
  constructor : function(store, item) {
    var subItem = store.get(item.audio._reference);
    dojo.mixin(this, {
      id : subItem.id,
      name : subItem.name
    });
    this._getUrl(store, subItem);
    this._processCaption(store, subItem);
  }
});
