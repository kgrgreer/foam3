foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name:  'QuickCustomer',
  properties:  [
    {
      class:  'Boolean',
      name:  'Taxable'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickAddress',
      name:  'BillAddr'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickAddress',
      name:  'ShipAddr'
    },
    {
      class:  'Boolean',
      name:  'Job'
    },
    {
      class:  'Boolean',
      name:  'BillWithParent'
    },
    {
      class:  'Int',
      name:  'Balance'
    },
    {
      class:  'Int',
      name:  'BalanceWithJobs'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickCurrencyReference',
      name:  'CurrencyRef'
    },
    {
      class:  'String',
      name:  'PreferredDeliveryMethod'
    },
    {
      class:  'String',
      name:  'domain'
    },
    {
      class:  'Boolean',
      name:  'sparse'
    },
    {
      class:  'Date',
      name:  'Id'
    },
    {
      class:  'Date',
      name:  'SyncToken'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickMetaData',
      name:  'MetaData'
    },
    {
      class:  'String',
      name:  'GivenName'
    },
    {
      class:  'String',
      name:  'FamilyName'
    },
    {
      class:  'String',
      name:  'FullyQualifiedName'
    },
    {
      class:  'String',
      name:  'CompanyName'
    },
    {
      class:  'String',
      name:  'DisplayName'
    },
    {
      class:  'String',
      name:  'PrintOnCheckName'
    },
    {
      class:  'Boolean',
      name:  'Active'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickPhoneNumber',
      name:  'PrimaryPhone'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickEMail',
      name:  'PrimaryEmailAddr'
    }
  ]
});