/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'CurrentTime',
  extends: 'foam.mlang.AbstractExpr',

  axioms: [
    { class: 'foam.pattern.Singleton' }
  ],

  methods: [
    {
      name: 'f',
      code: function(_) {
        return new Date();
      },
      javaCode: `
        return new java.util.Date();
      `
    },
    {
      name: 'toString',
      code: function() { return 'CurrentTime'; },
      javaCode: 'return "CurrentTime";'
    }
  ]
});
