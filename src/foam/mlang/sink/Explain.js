/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Explain',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Pseudo-Sink which outputs a human-readable description of an MDAO\'s execution plan for evaluating it.',

  properties: [
    {
      class: 'String',
      name:  'plan',
      help:  'Execution Plan'
    }
  ],

  methods: [
    function toString() { return this.plan; },
  ]
});
