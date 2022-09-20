/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.wizard.event',
  name: 'WizardErrorHint',
  documentation: `
    Instruction from a lower-level error handler to a higher-level error
    handler regarding how the flow of execution should be changed (or not).
  `,

  values: [
    {
      name: 'CONTINUE_AS_NORMAL',
      documentation: `
        Instruction is to behave as though no exception occurred.
      `
    },
    {
      name: 'AWAIT_FURTHER_ACTION',
      documentation: `
        Instruction is to let the user try again or try an alternative.

        Example: if a wizardlet's error handler says AWAIT_FURTHER_ACTION after
        a save action fails, the wizard controller will not move onto the next
        wizardlet. An error is displayed.
      `
    },
    {
      name: 'ABORT_FLOW',
      documentation: `
        Instruction is to release control to a parent flow.

        Example: if a wizardlet's error handler says ABORT_FLOW, the
        wizard controller will release control to the Sequence, thereby
        terminating the wizard.
      `
    }
  ]
});
