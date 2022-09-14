/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'ValueNSpecFactory',
  extends: 'foam.nanos.sandbox.AbstractNSpecFactory',

  javaImports: [
    'foam.nanos.logger.PrefixLogger'
  ],

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'create',
      type: 'Object',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return getValue();
      `
    }
  ]
});
