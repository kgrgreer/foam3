foam.INTERFACE({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerator',

  methods: [
    {
      name: 'add',
      documentation: `
        Adds an FObject to the underlying receipt generating model.
        An FObject added here will be able to have a receipt generated
        for it later.
      `,
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        }
      ]
    },
    {
      name: 'build',
      javaReturns: 'void',
      documentation: `
        Optional intermediate step that builds necessary models
        (i.e. a Merkle Tree) from which to generate receipts.`
    },
    {
      name: 'generate',
      javaReturns: 'net.nanopay.security.receipt.Receipt',
      documentation: `
        Generates a receipt given an FObject.
      `,
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        }
      ]
    }
  ]
});
