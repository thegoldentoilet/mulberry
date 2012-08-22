dojo.provide('toura.adapters.tourjs');

dojo.require('mulberry._Adapter');

dojo.declare('toura.adapters.tourjs', mulberry._Adapter, {
  // this parser has to do very, very little

  tableName: 'items',
  fields : [ 'id text', 'json text', 'source text' ],

  constructor : function(source) {
    this.source = source || 'main';
  },

  insertStatement : function(tableName, item) {
    return [
      "INSERT INTO " + tableName + "(id, json, source) VALUES ( ?, ?, ? )",
      [ item.id, JSON.stringify(item), this.source ]
    ];
  },
  processSelection : function(result) {
    var items = [],
        len = result.rows.length,
        rowData, i;

    for (i = 0; i < len; i++) {
      rowData = result.rows.item(i).json;
      items.push(rowData ? JSON.parse(rowData) : {});
    }

    return items;
  }

});
