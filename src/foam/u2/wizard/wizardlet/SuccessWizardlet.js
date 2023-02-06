/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'SuccessWizardlet',
  extends: 'foam.u2.wizard.wizardlet.BaseWizardlet',

  imports: [
    'currentMenu'
  ],

  properties: [
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'confirmationNumberPath'
    },
    {
      name: 'confirmationNumber',
      expression: function(confirmationNumberPath, data) {
        return confirmationNumberPath ? confirmationNumberPath.f(data) : '';
      }
    },
    {
      class: 'String',
      name: 'actionLabel',
      factory: function() {
        return "Return to " + this.currentMenu.label;
      }
    },
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
              class: 'foam.u2.wizard.wizardlet.SuccessWizardletView',
              confirmationNumber$: this.confirmationNumber$,
              message$: this.message$
            }
          })
        ];
      }
    },
    {
      class: 'Boolean',
      name: 'isLastWizardlet'
    }
  ]
});
