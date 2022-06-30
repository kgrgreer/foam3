/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'PassNSpecFactory',
  extends: 'foam.nanos.sandbox.AbstractNSpecFactory',

  methods: [
    {
      name: 'create',
      type: 'Object',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return getHostX().get(getNSpec().getName());
      `
    }
  ]
});
