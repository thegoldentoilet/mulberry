dojo.provide('toura.models._StorableAsset');

dojo.require('toura.URL');

(function() {

var appUrl = toura.URL.storedAsset;

dojo.declare('toura.models._StorableAsset', [], {
  _getUrl : function(store, item) {
    this.store = store;

    var assetType = item.type,
        subtypes = assetType === 'image' ?
          [ 'featuredSmall', 'featured', 'gallery', 'original' ] : false;

    if (subtypes) {
      dojo.forEach(subtypes, function(subtype) {
        var t = this[subtype] = item.subtype,
            isStreamed = this._isStreamed(item, subtype);

        t.url = (isStreamed && t.url) ? t.url : appUrl(assetType, t.filename);
      }, this);
    } else {
      var url = item.url;
      this.url = (this._isStreamed(item) && url) ? url : appUrl(assetType, item.filename);
    }
  },

  _isStreamed : function(item, type) {
    if (mulberry.forceStreaming) { return true; }
    if (mulberry.forceLocal) { return false; }

    if (!toura.manifest) {
      return true;
    }

    // first, ask the data whether the asset is streamed; if it is,
    // we assume the asset should be streamed
    if (!toura.manifest || item.streamed) { return true; }

    // if the asset is marked not to stream, we need to check whether
    // we have the asset on device

    // first, we determine the filename for the asset from the data
    var filename = type ? item.type.filename : item.filename;

    // next, we figure out where to look in toura.manifest
    var lookup = toura.manifest[item.type + 's'];

    // if the manifest doesn't have an entry for the asset type, we must stream
    if (!lookup || !dojo.isArray(lookup)) {
      return true;
    }

    // if the asset is in the manifest, then it's safe to not stream it
    if (dojo.indexOf(lookup, filename) > -1) {
      return false;
    }

    // if the asset isn't in the manifest, we're stuck streaming it
    return true;
  }
});

}());
