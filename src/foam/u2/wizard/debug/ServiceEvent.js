/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'ServiceEvent',
  extends: 'foam.u2.wizard.debug.WizardEvent',
  flags: ['web'],

  properties: [
    {
      name: 'serviceName',
      class: 'String'
    },
    {
      name: 'methodName',
      class: 'String'
    },
    {
      name: 'arguments',
      class: 'Array'
    },
    {
      name: 'summary',
      class: 'String',
      expression: function(serviceName, methodName, arguments) {
        return `${serviceName}.${methodName}(...)`;
      }
    }
  ]
});
