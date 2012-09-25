dojo.provide('toura.models.TextAsset');

dojo.declare('toura.models.TextAsset', null, {
  constructor : function(store, item) {
    dojo.mixin(this, {
      id : item.id,
      body : item.body,
      name : item.name,
      contexts : item.contexts
    });
  }
});
