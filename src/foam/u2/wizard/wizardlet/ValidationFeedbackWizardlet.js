/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'ValidationFeedbackWizardlet',
  extends: 'foam.nanos.crunch.ui.CapabilityWizardlet',

  requires: [
    'foam.u2.wizard.axiom.WizardAction'
  ],

  properties: [
    {
      name: 'dynamicActions',
      factory: function() {
      /* ignoreWarning */
        return [this.WizardAction.create({name: 'goNext', label: 'Next', code: async function(slot) {
            const wizardController = slot.data$.get();
            await wizardController.currentWizardlet.save();
            if ( ! wizardController.currentWizardlet.isValid ) return;
            wizardController.goNext();
          }})];
      }
    }
  ]

})
