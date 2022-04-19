/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'HealthFactory',

  documentation: 'Context Factory for generating Health instances',

  javaImplements: [
    'foam.core.XFactory'
  ],

  methods: [
    {
      name: 'create',
      args: 'Context x',
      type: 'Object',
      javaCode: 'return new Health(x);'
    }
  ]
});
