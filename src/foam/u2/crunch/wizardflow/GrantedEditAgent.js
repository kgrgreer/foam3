/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'GrantedEditAgent',
  implements: [
    'foam.core.ContextAgent'
  ],
  documentation: `
    Reconfigures wizard for approval when editing granted capabilities
  `,

  imports: [
    'crunchService',
    'rootCapability',
    'sequence'
  ],

  requires: [
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.u2.crunch.wizardflow.ApprovalRequestAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent'
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      var ucj = await this.crunchService.getJunction(null, this.rootCapability.id);

      if ( ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
        this.sequence
          .reconfigure('LoadCapabilitiesAgent', {
            waoSetting: this.LoadCapabilitiesAgent.WAOSetting.APPROVAL
          })
          .remove('LoadTopConfig')
          .remove('CheckPendingAgent')
          .remove('CheckNoDataAgent')
          .remove('SkipGrantedAgent')
          .remove('WizardStateAgent') // TEMPORARY
          .addAfter('SaveAllAgent', this.ApprovalRequestAgent, {
            group: 'treviso-fraud-ops'
          })
          ;
      }
    }
  ]
});
