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
    'IN_PROGRESS',
    'DISCARDED',
    'COMPLETED'
  ]
});
