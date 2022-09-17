/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.wizard',
  name: 'WizardStatus',
  documentation: `
    Describes if the wizard is active, discarded, or submitted.
  `,

  values: [
    {
      name: 'IN_PROGRESS',
      documentation: `
        Wizard is still open. If the status is found in this state when the
        wizard is expected to have been closed, it should be updated to ERROR.
      `
    },
    {
      name: 'DISCARDED',
      documentation: `
        Wizard was closed with a non-submit action, such as hitting the close
        button on a popup.
      `
    },
    {
      name: 'COMPLETED',
      documentation: `
        Wizard was closed with a submit action.

        Note that for a scrolling wizard COMPLETED does not imply that all
        wizardlets have been saved with valid data.
      `
    },
    {
      name: 'ERROR',
      documentation: `
        The final state of the wizard cannot be known due to an error.
      `
    }
  ]
});
