dojo.provide('toura.models.Video');

dojo.require('toura.models._CaptionedAsset');
dojo.require('toura.models._StorableAsset');

dojo.declare('toura.models.Video', [ toura.models._CaptionedAsset, toura.models._StorableAsset ], {
  constructor : function(store, item) {
    if (!item.video) {
      dojo.mixin(this, {
        id : item.id,
        name : item.name,
        url : item.url
      });

      return;
    }

    var subItem = store.get(item.vide._reference);
    dojo.mixin(this, {
      id : subItem.id,
      name : subItem.name,
      poster : subItem.poster
    });
    this._getUrl(store, subItem);
    this._processCaption(store, item);

    if (this.poster) {
      this.poster = this._posterOnDevice() ?
        toura.URL.storedAsset('videoPoster', this.poster.filename) :
        this.poster.url;
    }
  },

  _posterOnDevice : function() {
    var filename = this.poster.filename;

    return toura.manifest && toura.manifest.videos &&
      dojo.indexOf(toura.manifest.videos.posters || [], filename) > -1;
  }
});

