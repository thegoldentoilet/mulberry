dojo.provide('toura.components.AdTag');

dojo.require('mulberry._Component');

dojo.declare('toura.components.AdTag', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'AdTag/AdTag.haml'),

  adjustMarkup : function() {
    if (this.adConfig) {
      console.log("adConfig: ", this.adConfig);
      dojo.attr(this.adFrame, "src", this.adConfig);
    }
  },

  startup : function() {
    var loaded = false;
    var date = new Date();
    var now = date.getTime();

    console.log("now: ", now);
    dojo.connect(this.adFrame, "onload", function(){
       var date = new Date();
      var now = date.getTime();
       console.log("iframe onload: ", now);
       loaded=true;
    });
    setTimeout(dojo.hitch(this, function() {
      if(!loaded){
        console.log("in timeout");
        dojo.destroy(this.adFrame);
      }
    }), 2000);
    if (!this.adConfig) {
      this.destroy();
    } else {
      dojo.publish('/content/update');
    }
  }
});
