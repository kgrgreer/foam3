foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name:  'QuickCustomer',
  properties:  [
    {
      class:  'Boolean',
      name:  'taxable'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickAddress',
      name:  'billAddr'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickAddress',
      name:  'shipAddr'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickCurrencyReference',
      name:  'currencyRef'
    },
    {
      class:  'Long',
      name:  'id'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickMetaData',
      name:  'metaData'
    },
    {
      class:  'String',
      name:  'givenName'
    },
    {
      class:  'String',
      name:  'familyName'
    },
    {
      class:  'String',
      name:  'fullyQualifiedName'
    },
    {
      class:  'String',
      name:  'companyName'
    },
    {
      class:  'String',
      name:  'displayName'
    },
    {
      class:  'String',
      name:  'printOnCheckName'
    },
    {
      class:  'Boolean',
      name:  'active'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickPhoneNumber',
      name:  'primaryPhone'
    },
    {
      class:  'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickEMail',
      name:  'primaryEmailAddr'
    }
  ]
});