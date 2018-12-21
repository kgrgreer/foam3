foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Broker',

  documentation: 'Broker user information.',

  searchColumns: [],

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      documentation: 'Name of the broker.',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active',
      documentation: 'Determines if broker is available.'
    },

    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      documentation: 'User associated/manages broker.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address'
    },
    {
      class: 'foam.core.FObjectProperty',
      name: 'fee',
      of: 'net.nanopay.tx.model.Fee',
      documentation: 'Associated fees marked by broker.'
    }
  ]
});
