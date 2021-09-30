/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'CheckPendingAgent',
  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],
  documentation: `
    Prevents pending or granted capabilities from invoking the wizard.
  `,

  imports: [
    'capabilities',
    'crunchService',
    'ctrl',
    'rootCapability',
    'sequence'
  ],

  exports: [
    'cancelled'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus'
  ],

  properties: [
    {
      name: 'cancelled',
      class: 'Boolean'
    },
    {
      name: 'showToast',
      class: 'Boolean'
    }
  ],

  messages: [
    { name: 'CANNOT_OPEN_GRANTED', message: 'This capability has already been granted to you' },
    { name: 'CANNOT_OPEN_PENDING_TITLE', message: 'Pending Approval' },
    { name: 'CANNOT_OPEN_PENDING', message: 'Updates are not permitted at this time' },
    { name: 'CANNOT_OPEN_ACTION_PENDING_TITLE', message: 'Pending Review' }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      var ucj = await this.crunchService.getJunction(null, this.rootCapability.id);

      var shouldReopen = false;
      if ( ucj.status !== this.CapabilityJunctionStatus.AVAILABLE ) {
        var statusPending = ucj.status === this.CapabilityJunctionStatus.PENDING;
        var shouldReopen = await this.crunchService.maybeReopen(this.ctrl.__subContext__, ucj.targetId);
        if ( ! shouldReopen ) {
          if ( this.showToast ) {
            // checks for PENDING etc to display the correct message
            statusPending ? this.ctrl.notify(this.CANNOT_OPEN_PENDING_TITLE, this.CANNOT_OPEN_PENDING, this.LogLevel.WARN, true) : this.ctrl.notify(this.CANNOT_OPEN_GRANTED, '', this.LogLevel.INFO, true);

          }

          this.cancelled = true;
          this.sequence.endSequence();

          return;
        } else {
          if ( this.showToast && this.capabilities.length < 1 ) {
            // This is here because of a CertifyDataReviewed capability.
            this.ctrl.notify(this.CANNOT_OPEN_ACTION_PENDING_TITLE, this.CANNOT_OPEN_PENDING, this.LogLevel.WARN, true);
            this.cancelled = true;
            this.sequence.endSequence();

            return;
          }
        }
      }
    }
  ]
});
