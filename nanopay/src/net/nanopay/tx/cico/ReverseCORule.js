/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.KotakPaymentTransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! (obj instanceof COTransaction ) || obj instanceof KotakPaymentTransaction )
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
                .setSourceAccount(((DigitalAccount) txn.findSourceAccount(x)).getTrustAccount())
                .setAmount(txn.getAmount())
                .setName("Reversal of: "+txn.getId())
                .setAssociateTransaction(txn.getId())
                .build();

              try {
                ((DAO) x.get("transactionDAO")).put_(x, revTxn);
              }
              catch (Exception e) {
              //email Support about failure.
                Notification notification = new Notification();
                notification.setBody("Cash Out transaction id: " + txn.getId() + " was declined but the balance was not restored.");
                notification.setNotificationType("Cashout transaction declined");
                notification.setGroupId(txn.getSpid() + "-support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            }
          },"Reverse CO Rule");
        }
      `
    }
  ]
});
