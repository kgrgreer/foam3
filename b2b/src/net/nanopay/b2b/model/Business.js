foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'Business',

  documentation: 'Business information.',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
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
      class: 'String',
      name: 'secureAssetStore',
      required: true
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'Double',
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
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'sectorId'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessType',
      name: 'businessTypeId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.BankAccount',
      name: 'bankAccount',
      hidden: true,
      factory: function() { return net.nanopay.model.BankAccount.create(); },
      javaFactory: `return new net.nanopay.model.BankAccount();`
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'businessContact',
    },
    {
      class: 'Boolean',
      name: 'xeroConnect'
    }
  ]
});
