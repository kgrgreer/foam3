foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickContact',
  extends: 'net.nanopay.contacts.Contact',
  documentation: 'Class for Contacts imported from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'quickId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'quickUpdate',
      hidden: true
    }
  ]
});
