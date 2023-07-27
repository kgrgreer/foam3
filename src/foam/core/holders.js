/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'IntHolder',

  properties: [
    {
      name: 'value',
      class: 'Int'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'StringHolder',

  properties: [
    {
      name: 'value',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'toString',
      code: function() {
        return this.value;
      },
      javaCode: `
        return getValue();
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'BooleanHolder',

  properties: [
    {
      name: 'value',
      class: 'Boolean'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'RequiredBooleanHolder',
  extends: 'foam.core.BooleanHolder',

  messages: [
    { name: 'WRONG_VALUE', message: 'Wrong value' }
  ],

  properties: [
    {
      name: 'value',
      class: 'Boolean',
      validationPredicates: [
        {
          args: ['value'],
          query: 'value==true',
          errorMessage: 'WRONG_VALUE'
        }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'MapHolder',

  properties: [
    {
      name: 'value',
      class: 'Map'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'AnyHolder',

  properties: [
    'value'
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'VoidHolder',
  documentation: `
    Holder model to be used when there is no value required.
    For ex, use when a capability needs to display a view but doesn't require data
  `
});
