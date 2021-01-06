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
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
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
              // COMPLETED and DECLINED cannot change.
              txn.setStatus(TransactionStatus.COMPLETED);

              DigitalTransaction revTxn = new DigitalTransaction.Builder(x)
                .setDestinationAccount(((DigitalAccount) txn.findDestinationAccount(x)).getTrustAccount())
                .setSourceAccount(txn.getDestinationAccount())
                .setAmount(txn.getAmount())
                .setName("Reversal of DECLINED: "+txn.getId())
                .setAssociateTransaction(txn.getId())
                .build();

              try {
                ((DAO) x.get("localTransactionDAO")).put_(x, revTxn);
              }
              catch (Exception e) {
                //email Support about failure.
                Notification notification = new Notification();
                notification.setBody("Cash in transaction id: " + txn.getId() + " was declined but failed to revert the balance.");
                notification.setNotificationType("Cashin transaction declined");
                notification.setGroupId(txn.getSpid() + "-support");
                ((DAO) x.get("notificationDAO")).put(notification);
              }
            }
          },"Reverse CI Rule");
        }
      `
    }
  ]
});
