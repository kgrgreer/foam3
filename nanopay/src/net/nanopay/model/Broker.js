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
      required: true
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address'
    },
    {
      class: 'FObjectArray',
      name: 'fees',
      of: 'net.nanopay.tx.model.Fee'
    }
  ]
});
