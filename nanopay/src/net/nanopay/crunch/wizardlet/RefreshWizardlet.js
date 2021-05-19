/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.crunch.wizardlet',
  name: 'RefreshWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',
  imports: [ 'window' ],

  actions: [
    {
      class: 'foam.u2.wizard.axiom.WizardAction',
      name: 'submit',
      code: async function(x) {
        this.data.submitted = true;
        this.indicator = this.WizardletIndicator.SAVING;
        await this.wao.save(this, null);
        this.window.location.reload();
      }
    }
  ]
});
