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
  name: 'ReverseInterTrustRule',

  documentation: `
    Creates a reverse transaction for all declined or cancelled interTrust transactions, notifies
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.KotakPaymentTransaction',
    'net.nanopay.tx.cico.InterTrustTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! (obj instanceof InterTrustTransaction ) )
          return;

        // allow reversal when goes to declined from pending/sent.. or cancelled from pending.
        InterTrustTransaction oldTxn = (InterTrustTransaction) oldObj;
        InterTrustTransaction txn = (InterTrustTransaction) obj;
        if( ( txn.getStatus() == TransactionStatus.DECLINED && oldTxn != null &&
        ( oldTxn.getStatus() == TransactionStatus.SENT || oldTxn.getStatus() == TransactionStatus.PENDING) ) ||

        ( txn.getStatus() == TransactionStatus.CANCELLED && oldTxn != null &&
        ( oldTxn.getStatus() == TransactionStatus.PENDING ) ) ) {

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
                .setDestinationAccount(txn.getSourceAccount())
                .setSourceAccount(TrustAccount.find(x, ((DigitalAccount) txn.findSourceAccount(x)).findTrustAccount(x)).getId())
                .setAmount(txn.getTotal(x, txn.getSourceAccount()))
                .setName("Reversal of: "+txn.getId())
                .setAssociateTransaction(txn.getId())
                .build();

              try {
                ((DAO) x.get("transactionDAO")).put_(x, revTxn);
              }
              catch (Exception e) {
              //email Support about failure.
                Notification notification = new Notification();
                notification.setBody("intertrust transaction id: " + txn.getId() + " was declined but the balance was not restored.");
                notification.setNotificationType("intertrust transaction declined");
                notification.setGroupId("support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            }
          },"Reverse InterTrust Rule");
        }
        //declined after complete.. potentially big problem, as there could be multiple side effects.
        if ( txn.getStatus() == TransactionStatus.DECLINED && oldTxn != null &&
          ( oldTxn.getStatus() == TransactionStatus.COMPLETED ) ) {
          agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {

                Notification notification = new Notification();
                notification.setBody("intertrust transaction id: " + txn.getId() + " was declined after Completion");
                notification.setNotificationType("intertrust transaction declined after status complete");
                notification.setGroupId("support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            },"Reversal of InterTrust Rule detected Decline after Complete");
          }

      `
    }
  ]
});
