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
        Adds an FObject to the receipt generator. An FObject added
        here will be able to have a receipt generated for it later.
      `,
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          type: 'foam.core.FObject',
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
    },
    {
      name: 'generate',
      documentation: `
        Generates a receipt given an FObject.
      `,
      type: 'net.nanopay.security.receipt.Receipt',
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          type: 'foam.core.FObject',
          name: 'obj'
        }
      ]
    }
  ]
});
