/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.mlang',
  name: 'Expr',
  implements: [
    'foam.dao.SQLStatement',
    'foam.mlang.F',
  ],

  documentation: 'Expr interface extends F interface: partialEval -> Expr.',

  methods: [
    {
      name: 'partialEval',
      type: 'foam.mlang.Expr'
    },
    {
      name: 'authorize',
      flags: [ 'java' ],
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
