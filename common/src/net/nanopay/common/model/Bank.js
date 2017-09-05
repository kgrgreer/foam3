foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'Bank',

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
    }
  ]
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.common.model.Bank',
  targetModel: 'net.nanopay.common.model.Address',
  forwardName: 'address',
  inverseName: 'resident'
});