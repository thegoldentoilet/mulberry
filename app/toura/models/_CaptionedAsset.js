dojo.provide('toura.models._CaptionedAsset');

dojo.declare('toura.models._CaptionedAsset', null, {
  _processCaption : function(store, item) {
    if (!item.caption) { return; }
      dojo.mixin(this, {
        caption : item.body,
        name : item.name || this.name
      });
    }
});
