foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroContact',
  extends: 'net.nanopay.contacts.Contact',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
  ]
})