foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Broker',

  documentation: 'Broker user information.',

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
      class: 'FObjectArray',
      of: 'foam.core.FObject',
      name: 'accounts'
    },
    {
      class: 'String',
      name: 'branchId'
    },
    {
      class: 'String',
      name: 'memberIdentification'
    },
    {
      class: 'String',
      name: 'clearingSystemIdentification'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address'
    }
  ]
});
