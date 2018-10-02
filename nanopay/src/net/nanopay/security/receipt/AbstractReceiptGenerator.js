foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'AbstractReceiptGenerator',
  abstract: true,

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerator',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerationPolicy',
      name: 'receiptGenerationPolicy'
    }
  ],

  methods: [
    {
      name: 'add',
      javaCode: `
        getReceiptGenerationPolicy().update(obj);
        add_(obj);
      `
    },
    {
      name: 'add_',
      abstract: true,
      visibility: 'protected',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ]
    }
  ]
});
