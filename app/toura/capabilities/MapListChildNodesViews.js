// virtually identical to MapChildNodesViews.js
dojo.provide('toura.capabilities.MapListChildNodesViews');

dojo.require('toura.capabilities._MapChildNodesViews');

dojo.declare('toura.capabilities.MapListChildNodesViews', toura.capabilities._MapChildNodesViews, {

  connects : [
    ['page', 'init', '_showMap'],
    ['mapPageNav', 'toggleLayout', '_showList'],
    ['listPageNav', 'toggleLayout', '_showMap']
  ]
});
