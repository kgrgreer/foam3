/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptParameter',

  documentation: 'Key/value map intended to be used by a Script for time series input data.',

  implements: [ 'foam.nanos.auth.EnabledAware' ],

  tableColumns: [
    'enabled',
    'id',
    'name',
    'date'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      documentation: 'Name by which the Script will find this parameter',
      class: 'String',
      name: 'name'
    },
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'Map',
      name: 'parameters',
      factory: function() { return new Map(); },
      javaFactory: 'return new java.util.HashMap();'
    }
  ]
});
