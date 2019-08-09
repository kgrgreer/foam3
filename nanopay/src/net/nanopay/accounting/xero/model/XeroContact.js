foam.CLASS({
  package: 'net.nanopay.accounting.xero.model',
  name: 'XeroContact',
  extends: 'net.nanopay.contacts.Contact',
  documentation: 'Class for Contacts imported from Xero Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'xeroOrganizationId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'xeroUpdate',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'chooseBusiness',
      value: false,
      documentation: 'set this to true to let user manually select the business of this contact'
    },
    {
      class: 'Long',
      name: 'lastUpdated'
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      label: 'Xero Last Updated',
      visibility: 'RO'
    }
  ]
});
