dojo.provide('mulberry._Capability');

/**
 * @class
 */
dojo.declare('mulberry._Capability', null, {
  /**
   * An object defining the required components for the capability. The
   * object's keys are the property names that will be used to refer to the
   * component; the corresponding value is the name of the component that is
   * required.
   *
   * @example
   * For example:
   *
   *   {
   *     'imageGallery' : 'ImageGallery'
   *   }
   */
  requirements : {},

  /**
   * An array containing zero or more arrays specifying the connections that
   * the capability should set up.
   *
   * @example
   * For example:
   *
   *   [
   *     [ 'imageGallery', 'onScrollEnd', '_setCaption ]
   *   ]
   *
   * The first item in the array refers to the property name that was defined
   * in the requirements object for the component we want to listen to.
   *
   * The second item in the array is the method or event that we want to listen
   * to on the component.
   *
   * The third item in the array is the capability method that we want to run
   * when the event/method occurs.
   */
  connects : [],

  /**
   * @param {Object} config
   * - page: the page that the capability is associated with
   * - components: the components that are involved, specified as
   *   <screenName>:<componentName>
   */
  constructor : function(config) {
    dojo.mixin(this, config);

    this.domNode = this.page.domNode;
    this.node = this.page.node;

    if (!this._checkRequirements()) {
      console.error('Did not find required components for capability', this.declaredClass);
      throw("Did not find required components for capability " + this.declaredClass);
    }

    this._doLookups();
    this._doConnects();

    this.init();
  },

  /**
   * @public
   * This method can be implemented by individual capabilities, and will be run
   * once all capability setup is complete.
   */
  init : function() {
    // stub for implementation
  },

  /**
   * @private
   * Checks whether the components that are specified as required in the
   * capability definition are present
   *
   * @returns {Boolean} A boolean value indicating whether the requirements of
   * the capability have been met.
   */
  _checkRequirements : function() {
    var requirementsMet = true;

    dojo.forIn(this.requirements, function(propName, requiredComponentName) {
      var foundComponent;
      
      foundComponent = this._getComponent(requiredComponentName);
      requirementsMet = requirementsMet && foundComponent;

      if (!foundComponent) {
        console.warn('did not find', requiredComponentName);
      }
      
    }, this);

    return requirementsMet;
  },
  
  /**
   * @private
   * fetches a component based on its name; allows fetching by screen with the
   * colon-separated syntax
   *
   * @returns {Component OR null} Either returns the component, or a null value
   * on failure
   */
  _getComponent : function(componentName) {
    var component, screen,
        processedName = componentName.split(':');
    
    if (processedName.length === 2) {
      screen = this.page.getScreen(processedName[0]);

      if (!screen) {
        console.error('Capability', this.declaredClass, 'did not find the screen', processedName[0], 'on the page');
        return null;
      }
    }
    
    if (screen) {
      component = screen.getComponent(processedName[1]);
    } else {
      component = this.page.getComponent(componentName);
    }
    
    if (!component) {
      console.error('Capability', this.declaredClass, 'did not find component for', processedName[1], 'on the', processedName[0], 'screen');
      return null;
    }
    
    return component;
  },

  /**
   * @private
   * Associates the components specified by the page definition with the appropriate
   * property names, so that the capability can refer to the components in a
   * predictable manner.
   */
  _doLookups : function() {
    dojo.forIn(this.requirements, function(propName, componentName) {
      this[propName] = this._getComponent(componentName);
    }, this);
  },

  /**
   * @private
   * Sets up method/event listeners and interactions between components.
   */
  _doConnects : function() {
    dojo.forEach(this.connects, function(c) {
      this.connect.apply(this, c);
    }, this);
  },

  /**
   * Registers a connection with the capability's page, allowing for automatic
   * connection teardown when the page is destroyed.
   */
  connect : function(obj, method, fn) {
    if (dojo.isString(obj)) { obj = this[obj]; }
    this.page.connect(obj, method, dojo.hitch(this, fn));
  }
});

mulberry.capability = function(name, proto) {
  dojo.declare(
    'mulberry.capabilities.' +  name,
    mulberry._Capability,
    proto
  );
};
