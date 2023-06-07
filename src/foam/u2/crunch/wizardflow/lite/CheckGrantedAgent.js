/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.crunch.wizardflow.lite',
  name: 'CheckGrantedAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Check if a capable requirement is already granted
  `,

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  imports: [
    'capable',
    'rootCapability',
    'sequence'
  ],

  methods: [
    async function execute() {
      this.capable.capablePayloads.find(payload => {
        if ( payload.capability == this.rootCapability.id && payload.status == this.CapabilityJunctionStatus.GRANTED ) {
          this.sequence.endSequence();
        }
      })

    }
  ]
});
