foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'ClientAcceptanceDocumentService',

  implements: [
    'net.nanopay.documents.AcceptanceDocumentService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.documents.AcceptanceDocumentService',
      name: 'delegate'
    }
  ]
});
