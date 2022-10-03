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
    function toString () {
      return this.value;
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
  name: 'VoidHolder'
});
