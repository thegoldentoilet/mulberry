dojo.provide('toura.models._CaptionedAsset');

dojo.declare('toura.models._CaptionedAsset', null, {
  _processCaption : function(store, item) {
    if (!item.caption) { return; }
    var subItem = store.get(item.caption._reference);
    dojo.mixin(this, {
      caption : subItem.body,
      name : subItem.name || subItem.name
    });
    }
});
