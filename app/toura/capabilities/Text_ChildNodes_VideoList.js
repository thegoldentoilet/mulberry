dojo.provide('toura.capabilities.Text_ChildNodes_VideoList');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.Text_ChildNodes_VideoList', mulberry._Capability, {
  requirements : {
    text : 'BodyText',
    childNodes : 'ChildNodes',
    videoList: 'VideoList'
  },

  connects : [
    [ 'childNodes', 'updated', 'checkChildNodesCount' ]
  ],

  init: function() {
    this.checkChildNodesCount();
  },

  checkChildNodesCount : function() {
    if (this.childNodes.storeData.length === 0 && this.videoList.assets.length <= 1) {
      dojo.addClass(this.childNodes.region.domNode, 'empty');
    } else {
      dojo.removeClass(this.childNodes.region.domNode, 'empty');
    }
  }
});

