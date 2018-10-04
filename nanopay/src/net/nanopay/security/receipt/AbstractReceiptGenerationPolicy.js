foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'AbstractReceiptGenerationPolicy',
  abstract: true,

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerationPolicy'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'receiptGenerator',
    }
  ],

  methods: [
    {
      name: 'update',
      javaCode: ` `
    },
    {
      name: 'start',
      javaCode: ` `
    }
  ]
});
