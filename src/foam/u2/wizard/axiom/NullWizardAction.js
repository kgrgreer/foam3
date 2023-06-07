/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
  
foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'NullWizardAction',
  extends: 'foam.u2.wizard.axiom.WizardAction',

  documentation: 'WizardAction used when there is no action required',

  properties: [
    {
      name: 'code',
      value: () => {}
    },
    {
      name: 'isAvailable',
      value: () => false
    }
  ]
});
