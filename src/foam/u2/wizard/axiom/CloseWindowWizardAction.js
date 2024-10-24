/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'CloseWindowWizardAction',
  extends: 'foam.u2.wizard.axiom.WizardAction',

  documentation: `
    WizardAction that closes the current window.

    WARNING:
    This action will close the window immediately therefore the wizard sequence's
    context agents and wizardlets that come after the action will not be run.
  `,

  imports: [
    'window'
  ],

  properties: [
    {
      name: 'code',
      value: () => { this.window.close(); }
    },
    {
      name: 'label',
      value: 'Close'
    }
  ]
});

