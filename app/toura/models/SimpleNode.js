dojo.provide('toura.models.SimpleNode');

dojo.require('toura.URL');

(function() {

var cache = {};

dojo.subscribe('/tour/update', function() { cache = {}; });

dojo.declare('toura.models.SimpleNode', null, {
  constructor : function(store, item) {
    var id = item.id;
    if (cache[id]) {
      dojo.mixin(this, cache[id]);
      return;
    }

    dojo.mixin(this, {
      id : id,
      name :item.name
    });

    this.url = toura.URL.node(this.id);

    cache[id] = this;
  }
});

}());
