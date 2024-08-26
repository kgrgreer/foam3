/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'Mux',

  properties: [
    {
//      class: 'foam.mlang.ExprProperty',
      name: 'cond',
    },
    {
//      class: 'foam.mlang.ExprProperty',
      name: 'a',
    },
    {
  //    class: 'foam.mlang.ExprProperty',
      name: 'b'
    }
  ],
  methods: [
    {
      name: 'put',
      code: function(obj, s) {
        if ( this.cond.f(obj) )
          this.a.put(obj, s)
        else
          this.b.put(obj, s);
      }
    }
  ]
});
