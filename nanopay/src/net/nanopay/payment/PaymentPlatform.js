foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentPlatform',
  documentation: 'Payment Partner, Payment Rail, ... ',

  constants: [
    {
      type: 'String',
      name: 'REALEX',
      value: 'REALEX',
      swiftType: 'String',
    },
    {
      type: 'String',
      name: 'STRIPE',
      value: 'STRIPE',
      swiftType: 'String',
    },
    {
      type: 'String',
      name: 'DWOLLA',
      value: 'DWOLLA',
      swiftType: 'String',
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      required: true
    },
    {
      class: 'String',
      name: 'abbreviation',
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
