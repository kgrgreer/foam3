/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'WAOEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'method',
      class: 'String'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(method) {
        return method;
      }
    }
  ]
});
