foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'SlowDownRule',

  documentation: `In the event that clearing account or debt limit is insufficient for a planned debt transaction
  to successfully complete, transition it to a slow pay transaction.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DebtTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.account.Debtable',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.account.OverdraftAccount',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof DebtTransaction ) {
          DebtTransaction txn = (DebtTransaction) obj;
          Transaction parentTxn = txn.findParent(x);

          if ( txn.getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED &&
          ( (Transaction) oldObj ).getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED &&
          parentTxn instanceof CompositeTransaction ) {
            Account senderDigitalAccount = txn.findDestinationAccount(x);
            if ( ((Debtable) senderDigitalAccount).findDebtAccount(x).getLimit() <
            ( txn.getAmount() - (long) senderDigitalAccount.findBalance(x) ) ||
            ( (long) ((Debtable) senderDigitalAccount).findDebtAccount(x).findCreditorAccount(x).findBalance(x) ) <
            ( txn.getAmount() - (long) senderDigitalAccount.findBalance(x) ) ) {

              agency.submit(x, new ContextAgent() {
                @Override
                public void execute(X x) {
                  CITransaction ciTxn = (CITransaction) parentTxn.getChildren(x).find(INSTANCE_OF(CITransaction.class));
                  txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
                  txn.setParent(ciTxn.getId());
                  Logger logger = (Logger) x.get("logger");
                  logger.warning("FastPay Transaction Altered to Slow Pay due to insufficient debtlimit/clearing Amount");
                }
              });
            }
          }
        }
      `
    }
  ]
});
