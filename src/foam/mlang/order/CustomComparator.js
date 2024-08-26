/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.order',
  name: 'CustomComparator',
  implements: [ 'foam.mlang.order.Comparator' ],

  flags: [],
  // TODO: rename FunctionComparator

  documentation: 'A function to Comparator adapter.',

  properties: [
    {
      class: 'Function',
      name: 'compareFn'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        return this.compareFn(o1, o2);
      }
    },
    {
      name: 'toString',
      code: function() {
        return 'CUSTOM_COMPARE(' + this.compareFn.toString() + ')';
      }
    },
    {
      name: 'orderTail',
      code: function() { return undefined; },
      javaCode: 'return null;'
    },
    {
      /** TODO: allow user to set this to match the given function */
      name: 'orderPrimaryProperty',
      javaCode: 'return null;',
      code: function() { return undefined; }
    },
    {
      name: 'orderDirection',
      javaCode: 'return 1;',
      code: function() { return 1; }
    }
  ]
});
