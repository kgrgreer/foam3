/**
 * @license
 * Copyright 20188 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.token',
  name: 'Token',
  extends: 'foam.nanos.crunch.lite.BaseCapable',

  documentation: 'Represents a one-time access code linked to a specific User',

  javaImports: [
    'java.util.UUID'
  ],

  implements: [
    'foam.nanos.auth.CreatedAware',
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
    },
    {
      class: 'Boolean',
      name: 'processed',
      value: false
    },
    {
      class: 'DateTime',
      name: 'expiry',
      documentation: 'The token expiry date'
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'The token data',
      javaFactory: `return UUID.randomUUID().toString();`,
      tableWidth: 350
    },
    {
      class: 'Map',
      name: 'parameters',
      documentation: 'Additional token parameters'
    }
  ]
});
