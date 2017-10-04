foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Branch',

  documentation: 'Bank information.',

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
      class: 'String',
      name: 'financialId'
    },
    {
      class: 'String',
      name: 'BIC'
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