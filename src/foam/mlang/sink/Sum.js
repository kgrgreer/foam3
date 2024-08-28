/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sum',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which sums put() values.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'Double',
      name: 'value',
      value: 0
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, sub) { this.value += this.arg1.f(obj); },
      javaCode: 'setValue(getValue() + ((Number) this.arg1_.f(obj)).doubleValue());'
    }
  ]
});
