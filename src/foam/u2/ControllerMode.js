/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2',
  name: 'ControllerMode',

  documentation: 'CRUD controller modes: CREATE/VIEW/EDIT.',

  properties: [
    {
      class: 'String',
      name: 'modePropertyName'
    },
    {
      name: 'restrictDisplayMode',
      value: function(mode) { return mode; }
    }
  ],

  methods: [
    function getVisibilityValue(prop) {
      return prop.visibility || prop[this.modePropertyName];
    }
  ],

  values: [
    {
      name: 'CREATE',
      modePropertyName: 'createVisibility'
    },
    {
      name: 'VIEW',
      modePropertyName: 'readVisibility',
      restrictDisplayMode: function(mode) {
        return mode == foam.u2.DisplayMode.RW ? foam.u2.DisplayMode.RO : mode;
      }
    },
    {
      name: 'EDIT',
      modePropertyName: 'updateVisibility'
    }
  ]
});
