/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard.data',
  name: 'Loader',
  proxy: true,

  methods: [
    {
      name: 'load',
      async: true
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'NullLoader',
  implements: [ 'foam.u2.wizard.data.Loader' ],

  methods: [
    function load({ old }) {
      return old || null;
    }
  ]
});
