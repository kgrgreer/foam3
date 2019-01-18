foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryContact',
  documentation: 'Class for Contact import from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'Id'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryMetaData',
      name: 'MetaData'
    },
    {
      class: 'String',
      name: 'GivenName'
    },
    {
      class: 'String',
      name: 'FamilyName'
    },
    {
      class: 'String',
      name: 'FullyQualifiedName'
    },
    {
      class: 'String',
      name: 'CompanyName'
    },
    {
      class: 'String',
      name: 'DisplayName'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryEMail',
      name: 'PrimaryEmailAddr'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryAddress',
      name: 'ShipAddr'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryAddress',
      name: 'BillAddr'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryPhoneNumber',
      name: 'PrimaryPhone'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryPhoneNumber',
      name: 'Mobile'
    },
  ]
});
