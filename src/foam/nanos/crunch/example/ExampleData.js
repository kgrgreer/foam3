/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.example',
  name: 'ExampleData',

  requires: [
    'foam.nanos.auth.Phone'
  ],
  
  properties: [
    {
      name: 'testValidatedValue',
      class: 'FObjectProperty',
      required: true,
      of: 'foam.core.RequiredBooleanHolder'
    }
  ]

});
