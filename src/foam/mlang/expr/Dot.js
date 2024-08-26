/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Dot',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: `
    A Binary Expression which evaluates arg1 and passes the result to arg2.
    In other word, the output of arg1 is the receiver of arg2.

    For example, to get city from user address:

    DOT(User.ADDRESS, Address.CITY).f(user); // return user.address.city
  `,

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        return this.arg2.f(this.arg1.f(o));
      },
      javaCode: `
        Object receiver = getArg1().f(obj);
        if ( receiver == null ) return null;
        return getArg2().f(receiver);
      `
    },

    function toString() {
      return this.arg1 + '.' + this.arg2;
    },

    function comparePropertyValues(o1, o2) {
      /**
         Compare property values using arg2's property value comparator.
         Used by GroupBy
      **/
      return this.arg2.comparePropertyValues(o1, o2);
    }
  ]
});
