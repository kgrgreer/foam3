foam.INTERFACE({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerationPolicy',

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
      documentation: 'Update function which updates some internal state of the policy.',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ]
    }
  ]
});
