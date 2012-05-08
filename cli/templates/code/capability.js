dojo.provide('client.capabilities.{{name}}');

mulberry.capability('{{name}}', {
  requirements : {
  /*
   *  <componentLocalVariableName> : '<screenName[optional]>:<componentName>'
   *  e.g.:
   *  myImageThingee : 'ImageThingee'
   */
  },

  connects : [
  /*
   * ['<componentLocalVariableName>', '<eventName>', '<methodName>']
   */
  ],

  init : function() {
  }
});

