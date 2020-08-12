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
  package: 'net.nanopay.partner.treviso.tx',
  name: 'TrevisoCreateExchange',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create exchange when transaction is PENDING`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.partner.treviso.TrevisoService',
    'net.nanopay.tx.TransactionLineItem',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) x.get("logger");          
          DAO transactionDAO = ((DAO) x.get("localTransactionDAO")).inX(x);
          Transaction transaction = (Transaction) obj;
          TrevisoService trevisoService = (TrevisoService) x.get("trevisoService");
          try {
            transaction = trevisoService.createTransaction(transaction);
            transactionDAO.put(transaction);
          } catch (Throwable t) {
            String msg = "Error creating exchange for transaction " + transaction.getId();
            logger.error(msg, t);
            Notification notification = new Notification.Builder(x)
              .setTemplate("NOC")
              .setBody(msg + " " + t.getMessage())
              .build();
              ((DAO) x.get("localNotificationDAO")).put(notification);
            transaction.setStatus(TransactionStatus.FAILED);
            transactionDAO.put(transaction);
          }
        }

      }, "Rule to create exchange when transaction is PENDING");
      `
    }
  ]

});
