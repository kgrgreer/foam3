foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'ReverseCIRule',

  documentation: `
    Creates a reverse transaction for Cash Ins, notifies if unable to do so
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! (obj instanceof CITransaction ) )
          return;
        Transaction oldTxn = (Transaction) oldObj;
        CITransaction txn = (CITransaction) obj;
        if (txn.getStatus() == TransactionStatus.DECLINED && oldTxn.getStatus() == TransactionStatus.COMPLETED){
          agency.submit(getX(), new ContextAgent() {
            @Override
            public void execute(X x) {
              DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
                .setDestinationAccount(((BankAccount)txn.findSourceAccount(x)).findTrustAccount(x).getId())
                .setSourceAccount(txn.getDestinationAccount())
                .setAmount(txn.getAmount())
                .setName("Reversal of: "+txn.getId())
                .setIsQuoted(true)
                .setAssociateTransaction(txn.getId())
                .build();

              try {
                ((DAO) x.get("localTransactionDAO")).put_(x, revTxn);
              }
              catch (Exception e) {
              //email Support about failure.
                Notification notification = new Notification();
                notification.setEmailIsEnabled(true);
                notification.setBody("Cash in transaction id: " + txn.getId() + " was declined but failed to revert the balance.");
                notification.setNotificationType("Cashin transaction declined");
                notification.setGroupId("support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            }
          },"Reverse CI Rule");
        }
      `
    }
  ]
});
