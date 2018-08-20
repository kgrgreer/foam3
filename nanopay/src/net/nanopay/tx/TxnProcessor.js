foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TxnProcessor',
  documentation: 'Transaction Processor information.',

  searchColumns: [],

  constants: [
    {
      type: 'String',
      name: 'NONE',
      value: 'NONE',
      swiftType: 'String',
      swiftValue: '"NONE"'
    },
    {
      type: 'String',
      name: 'REALEX',
      value: 'REALEX',
      swiftType: 'String',
      swiftValue: '"REALEX"'
    },
    {
      type: 'String',
      name: 'STRIPE',
      value: 'STRIPE',
      swiftType: 'String',
      swiftValue: '"STRIPE"'
    },
    {
      type: 'String',
      name: 'DWOLLA',
      value: 'DWOLLA',
      swiftType: 'String',
      swiftValue: '"DWOLLA"'
    },
    {
      type: 'String',
      name: 'ALTERNA',
      value: 'ALTERNA',
      swiftType: 'String',
      swiftValue: '"ALTERNA"'
    },
    {
      type: 'String',
      name: 'INTERAC',
      value: 'INTERAC',
      swiftType: 'String',
      swiftValue: '"INTERAC"'
    },
   ],

  properties: [
    {
      class: 'String',
      name: 'id',
      required: true
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
      name: 'description',
      swiftName: 'swiftDescription'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'apiBaseUrl'
    },
    {
      documentation: 'Transaction Processor User account.',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      label: 'User'
    },
    {
      class: 'foam.core.FObjectProperty',
      name: 'fee',
      of: 'net.nanopay.tx.model.Fee'
    }
  ]
});
