foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  documentation: 'Adjusts the system digital balance amounts to account for the amount that payment-ops would of manually transfered.',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
      value: 'COMPLETED',
      javaFactory: 'return TransactionStatus.COMPLETED;'
    },
  ],

  methods: [
    {
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
        return oldTxn != null && oldTxn.getStatus() != TransactionStatus.COMPLETED && getStatus() == TransactionStatus.COMPLETED;
      `
    }
  ]
});
