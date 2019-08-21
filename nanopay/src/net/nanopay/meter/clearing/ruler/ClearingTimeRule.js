foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'ClearingTimeRule',
  extends: 'foam.nanos.ruler.Rule',
  abstract: true,

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'daoKey',
      value: 'localTransactionDAO',
      visibility: 'RO'
    },
    {
      name: 'ruleGroup',
      value: 'ClearingTime',
      visibility: 'RO',
      permissionRequired: true
    },
    {
      name: 'operation',
      value: 'UPDATE',
      visibility: 'RO'
    },
    {
      name: 'after',
      value: false,
      visibility: 'RO'
    },
    {
      name: 'predicate',
      javaFactory: `
        return AND(
          OR(
            EQ(DOT(NEW_OBJ, INSTANCE_OF(CITransaction.class)), true),
            EQ(DOT(NEW_OBJ, INSTANCE_OF(COTransaction.class)), true)
          ),
          NEQ(DOT(OLD_OBJ, Transaction.STATUS), TransactionStatus.SENT),
          EQ(DOT(NEW_OBJ, Transaction.STATUS), TransactionStatus.SENT)
        );
      `,
      visibility: 'RO'
    },
    {
      class: 'Int',
      name: 'duration',
      value: 2
    }
  ],

  methods: [
    {
      name: 'findAccount',
      type: 'net.nanopay.account.Account',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        return transaction instanceof COTransaction
          ? transaction.findDestinationAccount(x)
          : transaction.findSourceAccount(x);
      `
    },
    {
      name: 'incrClearingTime',
      args: [
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
        int clearingTime = transaction.getClearingTime();
        transaction.setClearingTime(clearingTime + getDuration());
      `
    }
  ]
});
