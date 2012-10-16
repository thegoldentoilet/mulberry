dojo.provide('toura.capabilities.Text_ChildNodes');

dojo.require('mulberry._Capability');

dojo.declare('toura.capabilities.Text_ChildNodes', mulberry._Capability, {
  requirements : {
    text : 'BodyText',
    childNodes : 'ChildNodes'
  },

  connects : [
    [ 'childNodes', 'updated', 'checkChildNodesCount' ]
  ],

  init: function() {
    this.checkChildNodesCount();
    
    if (this.text.bodyText.length === 0) {
      dojo.addClass(this.text.region.domNode, 'empty');
    }
  },

  checkChildNodesCount : function() {
    if (this.childNodes.storeData.length === 0) {
      dojo.addClass(this.childNodes.region.domNode, 'empty');
    } else {
      dojo.removeClass(this.childNodes.region.domNode, 'empty');
    }
  }
});

