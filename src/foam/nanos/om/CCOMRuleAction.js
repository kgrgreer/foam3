/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'CCOMRuleAction',
  extends: 'foam.nanos.om.OMRuleAction',

  javaImports: [
    'foam.core.X'
  ],

  methods: [
    {
      name: 'getLogger',
      args: [ { name: 'x', type: 'X' } ],
      type: 'OMLogger',
      javaCode: `return (OMLogger) x.get("CCOMLogger");`
    }
  ]
});

