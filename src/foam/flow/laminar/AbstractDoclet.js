/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'AbstractDoclet',
  implements: [
    'foam.core.ContextAgent'
  ],

  methods: [
    function toE (args, x) {
      return x.E();
    },
    async function execute (x) {
      return await this.execute_(x) || x;
    }
  ]
});
