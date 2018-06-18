foam.CLASS({
  package: 'net.nanopay.tx.tp',
  name: 'TnxProcessor',
  documentation: 'Tx.Tp information.',

  searchColumns: [],

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
    },
    {
      type: 'String',
      name: 'ALTERNA',
      value: 'ALTERNA',
      swiftType: 'String',
    }
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
      name: 'description'
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
      documentation: 'Tx.Tp User account.',
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
