foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Branch',
  // relationships: Processor
  documentation: 'Bank/Institution Branch Information.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true\
    },
    {
      class: 'String',
      name: 'branchId',
      required: true,
      documentation: 'Institution Branch identifier - such' +
          ' as the Indian Financial System Code.',
    },
    {
      class: 'String',
      name: 'clearingSystemIdentification',
      documentation: 'Clearing system identifier.'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address',
      documentation: 'Bank branch address.'
    }
  ]
});
