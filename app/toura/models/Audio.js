dojo.provide('toura.models.Audio');

dojo.require('toura.models._CaptionedAsset');
dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.Audio', [ toura.models._CaptionedAsset, toura.models._StorableAsset ], {
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : item.id,
      name : item.name
    });
    this._getUrl(store, item);
    this._processCaption(store, item);
  }
});
