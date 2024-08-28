/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'ContextObject',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression that returns object in the context using key.',

  properties: [
    {
      class: 'String',
      name: 'key'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        return o[this.key];
      },
      javaCode: `
        return ((foam.core.X) obj).get(getKey());
      `
    }
  ]
});
