dojo.provide('toura.components.ImageChildNodes');

dojo.require('toura.components._ChildNodeFeaturedImages');

dojo.declare('toura.components.ImageChildNodes', toura.components._ChildNodeFeaturedImages, {
  templateString : dojo.cache('toura.components', 'ImageChildNodes/ImageChildNodes.haml'),
  itemTemplate : Haml(dojo.cache('toura.components', 'ImageChildNodes/ImageChildNodesItem.haml'))

});
