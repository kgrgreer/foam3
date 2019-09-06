foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'GsTransactionScript',
  extends: 'net.nanopay.tx.GsScript',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],


  methods: [
   {
      documentation: 'Returns a transaction from a row of Gs file data',
      name: 'createTxn',
          args: [
            { name: 'x', type: 'Context' }
          ],
          type: 'net.nanopay.tx.model.TransactionStatus',
          javaCode: `

          `
        },
  ]
});
