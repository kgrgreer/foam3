/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.wizard',
  name: 'DynamicActionWizardlet',

  documentation: `
    This wizardlet has a 'dynamicActions' property, which allows the wizardlet
    to specify wizard actions dynamically.
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'dynamicActions',
      expression: () => []
    }
  ]
});
