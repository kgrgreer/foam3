/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'PropertyComparatorRefinement',
  refines: 'foam.core.Property',

  implements: [ 'foam.mlang.order.Comparator' ],

  methods: [
    {
      name: 'orderTail',
      code: function() { return; },
      javaCode: 'return null;'
    },
    {
      name: 'orderPrimaryProperty',
      code: function() { return this; },
      javaCode: 'return this;'
    },
    {
      name: 'orderDirection',
      code: function() { return 1; },
      javaCode: 'return 1;'
    },
    function partialEval(o) {
      return this;
    }
  ]
});
