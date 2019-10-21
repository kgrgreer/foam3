foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'ReverseCORule',

  documentation: `
    Creates a reverse transaction for all declined or cancelled CashOuts, notifies
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
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! (obj instanceof COTransaction ) )
          return;
        Transaction oldTxn = (Transaction) oldObj;
        COTransaction txn = (COTransaction) obj;
        if( ( txn.getStatus() == TransactionStatus.DECLINED && oldTxn != null &&
        ( oldTxn.getStatus() == TransactionStatus.SENT || oldTxn.getStatus() == TransactionStatus.COMPLETED) ) ||
        ( txn.getStatus() == TransactionStatus.CANCELLED && oldTxn != null &&
        ( oldTxn.getStatus() == TransactionStatus.PENDING || oldTxn.getStatus() == TransactionStatus.PAUSED ) ) ) {

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
                .setDestinationAccount(txn.getSourceAccount())
                .setSourceAccount(((BankAccount)txn.findDestinationAccount(x)).findTrustAccount(x).getId())
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
                notification.setBody("Cash Out transaction id: " + txn.getId() + " was declined but the balance was not restored.");
                notification.setNotificationType("Cashout transaction declined");
                notification.setGroupId("support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            }
          },"Reverse CO Rule");
        }
      `
    }
  ]
});
