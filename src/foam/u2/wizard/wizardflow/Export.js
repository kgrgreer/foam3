/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardflow',
  name: 'Export',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    'value'
  ],

  methods: [
    async function execute (x) {
      x = x || this.__context__;
      return x.createSubContext({
        [this.name]: this.value
      });
    }
  ]
});
