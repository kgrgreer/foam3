/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'UnlockPaymentsWizardConfig',
  extends: 'foam.u2.crunch.EasyCrunchWizard',

  implements: [
    'foam.core.ContextAware',
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.model.BusinessUserJunction',
    'foam.u2.crunch.wizardflow.SaveAllAgent'
  ],

  imports: [
    'subject'
  ],

  methods: [
    {
      name: 'applyTo',
      flags: ['web'],
      code: function applyTo(sequence) {
        this.SUPER(sequence);
        sequence.remove('PutFinalPayloadsAgent');
        sequence.addBefore('CapabilityStoreAgent', this.SaveAllAgent);
      }
    },
    {
      name: 'execute',
      flags: ['web'],
      code: async function execute() {
        this.allowSkipping = await this.subject.user.signingOfficers.dao
        .find(this.subject.realUser.id) == null;
      }
    }
  ]
});
