dojo.provide('toura.models.BackgroundImage');

dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.BackgroundImage', toura.models._StorableAsset, {
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : item.id,
      name : item.name,
      height : item.height || null,
      width : item.width || null
    });

    this._getUrl(store, item);
  }
});
