/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.u2.wizard.event',
  name: 'WizardEventType',

  values: [
    {
      name: 'WIZARDLET_SAVE',
      documentation: `
        The user has proceeded from this particular wizardlet
      `
    },
    {
      name: 'WIZARDLET_LOAD',
      documentation: `
        A wizardlet's load() method was called
      `
    },
    {
      name: 'WIZARDLET_GO_NEXT',
      documentation: `
        A wizardlet's next() method was called
      `
    }
  ]
});
