foam.INTERFACE({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerator',

  documentation: `
    Receipt generator interface for usage with ReceiptGeneratingDAO.
  `,

  implements: [
    'foam.nanos.NanoService'
  ],

  methods: [
    {
      name: 'add',
      documentation: `
        Adds an FObject to the underlying receipt generating model.
        An FObject added here will be able to have a receipt generated
        for it later.
      `,
      javaReturns: 'void',
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        }
      ]
    },
    {
      name: 'build',
      documentation: `
        Optional intermediate step that builds necessary models
        (i.e. a Merkle Tree) from which to generate receipts.
      `,
      javaReturns: 'void'
    },
    {
      name: 'generate',
      documentation: `
        Generates a receipt given an FObject.
      `,
      javaReturns: 'net.nanopay.security.receipt.Receipt',
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        }
      ]
    }
  ]
});
