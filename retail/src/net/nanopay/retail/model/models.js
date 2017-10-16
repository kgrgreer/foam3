foam.CLASS({
  package: 'net.nanopay.retail.model',
  name: 'BusinessInformation',

  documentation: 'Business information',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'businessName',
      required: true
    },
    {
      class: 'String',
      name: 'email',
      required: true
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'profileImageURL'
    },
    {
      class: 'String',
      name: 'defaultContact'
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'String',
      name: 'businessNumber'
    },
    {
      class: 'String',
      name: 'idVerificationUrl'
    },
    {
      class: 'String',
      name: 'businessVerificationUrl'
    },
    {
      class: 'String',
      name: 'website'
    },
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'String',
      name: 'sectorId'
    },
    {
      class: 'String',
      name: 'businessTypeId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.BankAccount',
      name: 'bankAccount',
      hidden: true,
      factory: function() { return net.nanopay.model.BankAccount.create(); }
    },
    {
      class: 'String',
      name: 'businessContact'
    },
    {
      class: 'Array',
      of: 'net.nanopay.model.Address',
      name: 'address'
    },
    {
      class: 'String',
      name: 'city'
    },
    {
      class: 'String',
      name: 'postalCode'
    }
  ]
});