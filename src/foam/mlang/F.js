/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mlang',
  name: 'F',

  documentation: 'F interface: f(obj) -> val.',

  methods: [
    {
      name: 'f',
      type: 'Any',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ]
    }
  ]
});


// Investigate: If we use "extends: 'foam.mlang.F'" it generates the content properly for both F and Expr.
// But we have the Constant that extends the AbstractExpr that implements Expr and in this case, the f method
// (that comes from the F) interface is "losing" its type and returning void instead of returning the same defined
// on the interface as it should.
