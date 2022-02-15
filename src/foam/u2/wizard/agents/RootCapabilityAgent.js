/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'RootCapabilityAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Set the root capability ID in context to a specific value.
  `,

  exports: [
    'rootCapability'
  ],

  properties: [
    {
      name: 'rootCapability',
      class: 'String'
    }
  ],

  methods: [
    async function execute() {
    }
  ]
});
