/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.crunch.ui',
  name: 'LiftingAwareWizardlet',
  documentation: `
    A wizardlet that implements handleLifting(), which is useful for creating
    ArraySlot listeners on the availability of lifted or unlifted wizardlets.
  `,

  methods: [
    {
      name: 'handleLifting',
      flags: ['web']
    }
  ]
});

