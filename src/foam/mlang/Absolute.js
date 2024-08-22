/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Absolute',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'delegate'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(obj) {
        return Math.abs(this.delegate.f(obj));
      }
    }
  ]
});
