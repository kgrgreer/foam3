/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'SigningOfficerQuestionWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'auth',
    'crunchController',
    'notify'
  ],

  messages: [
    {
      name: 'SUCCESS_SIGNING_OFFICER_QUESTION',
      message: 'Thank you! Please fill in the additional details required for signing officer privileges.'
    },
    {
      name: 'SUCCESS_SIGNING_OFFICER_INVITED',
      message: 'Thank you! Please complete the unlock international and domestic payment and invoicing for approval of signing officer.'
    }
  ],

  methods: [
    {
      flags: ['web'],
      name: 'save',
      code: async function() {
        await this.SUPER();
        this.crunchController.purgeCachedCapabilityDAOs();
        this.auth.check(null, 'certifydatareviewed.rw.reviewed');
        var isInvite = this.data && ! this.data.isSigningOfficer;
        this.notify(isInvite ? this.SUCCESS_SIGNING_OFFICER_INVITED : this.SUCCESS_SIGNING_OFFICER_QUESTION, '', this.LogLevel.INFO, true)
        return;
      }
    }
  ]
});
