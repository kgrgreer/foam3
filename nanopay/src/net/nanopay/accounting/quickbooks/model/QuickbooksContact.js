foam.CLASS({
  package: 'net.nanopay.accounting.quickbooks.model',
  name: 'QuickbooksContact',
  extends: 'net.nanopay.contacts.Contact',
  documentation: 'Class for Contacts imported from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'quickId'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'Boolean',
      name: 'chooseBusiness',
      value: false,
      documentation: 'set this to true to let user manually select the business of this contact'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'quickUpdate',
      hidden: true
    },
    {
      class: 'Long',
      name: 'lastUpdated'
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      label: 'Quickbooks Last Updated',
      visibility: 'RO'
    }
  ]
});
