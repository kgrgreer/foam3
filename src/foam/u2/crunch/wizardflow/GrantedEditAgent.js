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
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.WAOSettingAgent',
    'foam.u2.crunch.wizardflow.SkipMode'
  ],

  properties: [
    {
      name: 'subject',
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      documentation: `
        The requested subject associated to the ucj. Should only be set
        when used by a permissioned back-office user.
      `
    }
  ],

  methods: [
    // If Property expressions ever unwrap promises this method can be blank.
    async function execute() {
      var ucj = this.subject ? 
        await this.crunchService.getJunctionFor(null, this.rootCapability.id, this.subject.user, this.subject.realUser) : 
        await this.crunchService.getJunction(null, this.rootCapability.id);
      var isRenewable = await this.crunchService.isRenewable(this.__subContext__, this.rootCapability.id);
      if ( ucj.status === this.CapabilityJunctionStatus.GRANTED ) {
        if ( isRenewable ) {
          // reopening a renewable capability
          this.sequence
            .reconfigure('SkipGrantedAgent', { mode: this.SkipMode.HIDE })
            .remove('AutoSaveWizardletsAgent')
            .remove('WizardStateAgent');
          return;
        }
        this.sequence
          .reconfigure('WAOSettingAgent', {
            waoSetting: this.WAOSettingAgent.WAOSetting.APPROVAL
          })
          .remove('LoadTopConfig')
          .remove('CheckPendingAgent')
          .remove('CheckNoDataAgent')
          .remove('SkipGrantedAgent')
          .remove('WizardStateAgent') // TEMPORARY
          // TODO: uncomment below after finishing the feature
          // .addAfter('SaveAllAgent', this.ApprovalRequestAgent, {
          //   group: 'treviso-fraud-ops'
          // })
          ;
      }
    }
  ]
});
