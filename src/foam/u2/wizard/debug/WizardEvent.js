/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'WizardEvent',
  flags: ['web'],

  tableColumns: ['name', 'summary'],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    {
      name: 'name',
      class: 'String',
      factory: function () {
        return this.cls_.name;
      }
    },
    {
      name: 'summary',
      class: 'String'
    },
    {
      name: 'seqNo',
      class: 'Int'
    }
  ]
});
