foam.INTERFACE({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerationPolicy',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'receiptGenerator',
    }
  ]
});
