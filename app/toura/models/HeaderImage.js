dojo.provide('toura.models.HeaderImage');

dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.HeaderImage', [ toura.models._StorableAsset, toura.models._CaptionedAsset ], {
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : item.id,
      name : item.name,
      height : item.height || null,
      width : item.width || null
    });

    this._getUrl(store, item);
    this._processCaption(store, item);

    this.destination = /^http/.test(this.name) ? this.name : false;
  }
});
