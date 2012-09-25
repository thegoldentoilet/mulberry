dojo.provide('toura.models.Data');

dojo.declare('toura.models.Data', null, {
  constructor : function(store, item) {
    var subItem = store.get(item.dataAsset._reference);
     
    dojo.mixin(this, {
      id : subItem.id,
      name : subItem.name,
      type : subItem.dataType,
      json : JSON.parse(subItem.value)
    });
  }
});
