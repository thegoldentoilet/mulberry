// virtually identical to MapChildNodesViews.js
dojo.provide('toura.capabilities.ListMapChildNodesViews');

dojo.require('toura.capabilities._MapChildNodesViews');

dojo.declare('toura.capabilities.ListMapChildNodesViews', toura.capabilities._MapChildNodesViews, {

  connects : [
    ['page', 'init', '_showList'],
    ['mapPageNav', 'toggleLayout', '_showList'],
    ['listPageNav', 'toggleLayout', '_showMap']
  ]
});
