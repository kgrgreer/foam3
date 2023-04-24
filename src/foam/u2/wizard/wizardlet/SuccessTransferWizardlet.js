/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'SuccessTransferWizardlet',
  extends: 'foam.u2.wizard.wizardlet.SuccessWizardlet',

  imports: [
    'currentMenu'
  ],

  properties: [
    {
      name: 'sections',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.WizardletSection',
      preSet: function (_, val) {
        // Set 'wizardlet' reference in case this was configured in a journal.
        // Note: when this preSet was added it broke FlatteningCapabilityWizardlet.
        //   Now FlatteningCapabilityWizardlet overrides this preSet.
        for ( let wizardletSection of val ) {
          wizardletSection.wizardlet = this;
        }
        return val;
      },
      factory: function () {
        return [
          this.WizardletSection.create({
            title: this.title,
            isAvailable: true,
            customView: {
              class: 'foam.u2.wizard.wizardlet.SuccessTransferWizardletView',
              message$: this.message$
            }
          })
        ];
      }
    }
  ]
});
