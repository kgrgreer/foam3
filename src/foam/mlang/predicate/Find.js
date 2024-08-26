/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Find',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: `Predicate returns true if result of second arg found in first array argument.
   Unlike contains, the second arg is applied to every element of first arg before evaluating`,

  methods: [
    {
      name: 'f',
      code: function(o) {
        let self = this;
        var arg1 = this.arg1.f(o);
        if ( Array.isArray(arg1) ) {
          return !! arg1.find(function(a) {
            return self.arg2.f(a);
          })
        }
        return arg1 ? arg1.indexOf(arg2) !== -1 : false;
      },
      javaCode:
      `
      // TODO
      return true;
      `
    },
    {
      name: 'createStatement',
      javaCode: `return " '" + getArg1().createStatement() + "' like '%" + getArg2().createStatement() + "%' ";`
    }
  ]
});
