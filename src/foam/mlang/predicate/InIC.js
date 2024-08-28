/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'InIC',
  extends: 'foam.mlang.predicate.ArrayBinary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2, case insensitive.',

  properties: [
    [ 'upperCase_', true ]
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o);
      var rhs = this.arg2.f(o);

      if ( lhs.toUpperCase ) lhs = lhs.toString().toUpperCase();

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) )
        return !! this.valueSet_[lhs];

      if ( ! rhs ) return false;

      return rhs.toString().toUpperCase().indexOf(lhs) !== -1;
    }
  ]
});
