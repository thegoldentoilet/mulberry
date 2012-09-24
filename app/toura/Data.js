dojo.provide('toura.Data');

//dojo.require('dojo.data.ItemFileReadStore');
dojo.require('dojo.store.Memory');
dojo.require('dojo.store.Observable');
dojo.require('toura.models.TextAsset');
dojo.require('toura.models.SearchResult');
dojo.require('toura.models.Node');
dojo.require('toura.models.Feed');
dojo.require('toura.models.BackgroundImage');
dojo.require('toura.models.FeaturedImage');

dojo.declare('toura.Data', null, {
  cache : {},
  searchCache : {},

  models : {
    node : toura.models.Node,
    backgroundImage : toura.models.BackgroundImage,
    feed : toura.models.Feed,
    featuredImage : toura.models.FeaturedImage
  },

  constructor : function(data) {
    this.loadData(data);
  },

  loadData : function(data) {
    this.cache = {};
    this.searchCache = {};

    this._store = new dojo.store.Observable(new dojo.store.Memory({
      data : data
    }));

    this.onLoadData(data);
  },

  onLoadData : function(data) {
    dojo.publish('/data/loaded', [ data ]);
    // stub for connection
  },

  getModel : function(id, type) {
    if (!id) {
      throw new Error('toura.Data::getModel requires an id. Possibly your hash string is invalid?');
    }

    if (!dojo.isString(id)) {
      throw new Error('toura.Data::getModel requires the id to be a string');
    }

    var cache = this.cache,
        store = this._store,
        item, Model;

    if (!cache[id]) {
      item = store.get(id);
      if (!item) { return false; }

      type = type || item.type;
      Model = this.models[type];

      if (item && !Model) {
        throw new Error('toura.Data::getModel no model for type ' + type);
      }

      cache[id] = new Model(store, item);
    }

    return cache[id];
  },

  getById : function(id) {
    return this._store.get(id);
  },

  search : function(term) {
    if (!term || !dojo.trim(term)) { return []; }

    term = dojo.trim(term.replace(/\W/g, ' '));

    if (this.searchCache[term]) {
      return this.searchCache[term];
    }

    /*
     * Known limitations:
     *
     * - Only searches text assets and node titles
     * - Only searches for exact match
     */
    var matchingTextAssets = [],
        searchResults = [],
        store = this._store,
        re = new RegExp(term, 'i'),
        seen = {},
        Model = toura.models.SearchResult;

    //need to check query format for memory store
    var queries = [
      { type : 'text-asset', body : re },
      { type : 'text-asset', name : re }
    ];

    //dojo.forEach(queries, function(q) {
      store.query(function(object){
        return object.type === 'text-assett' && (object.body == re || object.name == re);
      }).foreach(function(a){
        var ta = new toura.models.TextAsset(store, a);
          dojo.map(ta.contexts, function(c) {
            searchResults.push(new Model(store, {
              textAsset : ta, context : c
            }));
          });
      });
    //});
    
    store.query({ type : 'node', name : re }).map(function(item){
      searchResults.push(new Model(store, item));
    });
    
    store.query({ type : 'node', identifier : re }).map(function(item){
      searchResults.push(new toura.models.SearchResult(store, item));
    });

   

    // de-dupe
    searchResults = dojo.filter(searchResults, function(r) {
      if (seen[r.nodeId] && r.type === 'node') {
        return false;
      }

      if (seen[r.url]) {
        return false;
      }

      seen[r.url] = true;
      seen[r.nodeId] = true;
      return true;
    });

    this.searchCache[term] = searchResults;
    return searchResults;
  }
});
