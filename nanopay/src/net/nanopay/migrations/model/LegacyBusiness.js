foam.CLASS({
  package: 'net.nanopay.migrations.model',
  name: 'LegacyBusiness',

  tableColumns: [
    'bankName', 'balance', 'minBalance', 'status'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'legacyId'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'String',
      name: 'profileImageUrl'
    },
    {
      class: 'Long',
      name: 'secureAssetStore'
    },
    {
      class: 'Boolean',
      name: 'active'
    },
    {
      class: 'Boolean',
      name: 'account'
    },
    {
      class: 'Long',
      name: 'businessNumber'
    },
    {
      class: 'String',
      name: 'idVerificationUrl'
    },
    {
      class: 'String',
      name: 'businessVerificationUrl'
    }
  ]
});