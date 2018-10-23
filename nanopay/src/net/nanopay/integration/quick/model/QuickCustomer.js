foam.CLASS({
  package:  'net.nanopay.integration.quick.model',
  name:  'QuickCustomer',
  properties:  [
    {
      class:  'String',
      name:  'Id'
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
      name: 'DisplayName'
    },
  ]
});