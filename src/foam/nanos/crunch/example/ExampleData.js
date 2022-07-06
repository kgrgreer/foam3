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