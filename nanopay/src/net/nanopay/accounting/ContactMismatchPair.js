foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'ContactMismatchPair',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'existContact'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'newContact'
    }
  ]
});

