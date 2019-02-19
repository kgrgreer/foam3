foam.CLASS({
  package: 'net.nanopay.settings',
  name: 'ClientAcceptanceDocumentService',

  implements: [
    'net.nanopay.settings.AcceptanceDocumentService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.settings.AcceptanceDocumentService',
      name: 'delegate'
    }
  ]
});
