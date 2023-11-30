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
      class: 'String',
      adapt: function(o, n) {
        if ( foam.nanos.crunch.Capability.isInstance(n) ) {
          return n.id;
        }
        return n;
      }
    }
  ],

  methods: [
    async function execute() {
    }
  ]
});
