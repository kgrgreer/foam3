/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'AbstractUnarySink',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.core.Serializable'
  ],

  documentation: 'An Abstract Sink baseclass which takes only one argument.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    }
  ]
});
