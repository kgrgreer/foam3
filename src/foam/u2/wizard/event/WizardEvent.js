/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.event',
  name: 'WizardEvent',

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.wizard.event.WizardEventType',
      name: 'eventType'
    },
    'wizardlet'
  ]
});
