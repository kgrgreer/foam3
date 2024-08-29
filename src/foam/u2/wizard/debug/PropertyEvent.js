/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'PropertyEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.internal.PropertyUpdate'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(data) {
        return data && data.path.join('.');
      }
    }
  ]
});
