foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'GreenfenceTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return false;
      `
    }
  ]
});
