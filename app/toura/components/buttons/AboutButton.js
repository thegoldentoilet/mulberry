dojo.provide('toura.components.buttons.MoreDrawerButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.buttons.MoreDrawerButton', toura.components.buttons._Button, {
  initializeStrings : function() {
    this.i18n_text = this.getString('MORE');
  }
});
dojo.provide('toura.components.buttons.AboutButton');

dojo.require('toura.components.buttons._Button');

dojo.declare('toura.components.buttons.AboutButton', toura.components.buttons._Button, {
  "class" : 'about',

  prepareData : function() {
    this.url = toura.URL.about();
  },

  initializeStrings : function() {
    this.i18n_text = this.getString('ABOUT');
  }
});

dojo.mixin(toura.components.buttons.AboutButton, {
  isAvailable : function() {
    var appConfig = mulberry.app.Config.get('app');
    return appConfig.aboutEnabled && !!appConfig.aboutNodeId;
  }
});

