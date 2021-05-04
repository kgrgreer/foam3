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
  package: 'net.nanopay.country.br.tx.ruler',
  name: 'ExchangeLimitTransactionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.Constant',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.fee.SpotRate',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionEvent',
    'net.nanopay.partner.treviso.TrevisoService',
    'net.nanopay.country.br.tx.ExchangeLimitTransaction',

    'static foam.mlang.MLang.*',
  ],

  documentation: `To check the exchange limit and keep ExchangeLimitTransaction
    staying in pending until limit check is passed
  `,

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ExchangeLimitTransaction txn = (ExchangeLimitTransaction) obj;
            DAO txnDAO = (DAO) x.get("localTransactionDAO");

            Transaction trevisoTxn = (Transaction) txnDAO.find(EQ(Transaction.PARENT,txn.getId()));

            try {
              User sender = txn.findSourceAccount(x).findOwner(x);

              // check the limit
              if ( checkExchangeLimit(x, trevisoTxn, sender) ) {
                txn.setStatus(TransactionStatus.COMPLETED);
                txnDAO.put(txn);
              } else {
                DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
                DAO filteredApprovalRequestDAO = approvalRequestDAO.where(
                  AND(
                    EQ(ApprovalRequest.SERVER_DAO_KEY, "localTransactionDAO"),
                    EQ(ApprovalRequest.OBJ_ID, txn.getId()),
                    EQ(ApprovalRequest.IS_FULFILLED, false)
                  )
                );

                ApprovalStatus approval = ApprovalRequestUtil.getState(filteredApprovalRequestDAO);
                String senderSummary = sender.toSummary();
                String agentGroup = sender.getSpid() + "-payment-ops";
                String notificationBody;

                if ( approval == null ) {
                  approvalRequestDAO.put(
                    new ApprovalRequest.Builder(x)
                      .setClassificationEnum(ApprovalRequestClassificationEnum.EXCHAGE_LIMIT_EXCEEDED)
                      .setDescription(senderSummary + " has initiated a transaction that exceeds the allowed limit. " +
                        "Please review the transaction. ")
                      .setDaoKey("transactionDAO")
                      .setServerDaoKey("localTransactionDAO")
                      .setObjId(txn.getId())
                      .setGroup(agentGroup)
                      .setCreatedFor(sender.getId())
                      .setStatus(ApprovalStatus.REQUESTED).build());

                  // Notify the sender that the transaction failed without telling them limit check failed
                  notificationBody = "Your transaction ( transaction id : " + txn.getId()
                    + " ) requires further attention. Please contact the agent. ";
                  notifySender(x, sender.getId(), txn.getId(), notificationBody, "Transaction failed");

                  // Notify the agent that the transaction failed since limit is exceeded
                  notificationBody = senderSummary + " has initiated a transaction ( transaction id : " + txn.getId()
                    + " ) that exceeds the allowed limit. ";
                  notifyAgent(x, agentGroup, txn.getId(), notificationBody, "Limit exceeded and transaction failed");

                } else if ( approval == ApprovalStatus.APPROVED ) {
                  // Mark the approved approval requests as fulfilled so that
                  // it will not be reconsidered on re-entrance.
                  filteredApprovalRequestDAO.select(new AbstractSink() {
                    @Override
                    public void put(Object o, Detachable d) {
                      var approvalRequest = (ApprovalRequest) ((FObject) o).fclone();
                      approvalRequest.setIsFulfilled(true);
                      approvalRequestDAO.put(approvalRequest);
                    }
                  });

                  // Resent approval request as the limit check remains fail
                  approvalRequestDAO.put(
                    new ApprovalRequest.Builder(x)
                      .setClassificationEnum(ApprovalRequestClassificationEnum.EXCHAGE_LIMIT_EXCEEDED)
                      .setDescription("A transaction for " + senderSummary
                        + " was approved but the amount exceeded the allowed limit again. Please review the transaction. ")
                      .setDaoKey("transactionDAO")
                      .setServerDaoKey("localTransactionDAO")
                      .setObjId(txn.getId())
                      .setGroup(agentGroup)
                      .setStatus(ApprovalStatus.REQUESTED).build());

                  // Notify the agent that the transaction exceeded the limit and an approval has been made before
                  notificationBody = "A transaction ( transaction id : " + txn.getId()
                    + " ) by " + senderSummary + " was approved but the amount exceeded the allowed limit again. ";
                  notifyAgent(x, agentGroup, txn.getId(), notificationBody, "Limit exceeded and need approval again");

                } else if ( approval == ApprovalStatus.REJECTED ) {
                  txn.setStatus(TransactionStatus.DECLINED);
                  txn.getTransactionEvents(x).put_(x, new TransactionEvent("Approval Rejected"));
                  txnDAO.put(txn);

                  // Send notifications
                  // Notify the sender that the transaction failed and approval rejected
                  notificationBody = "Your transaction ( transaction id : "
                    + txn.getId() + " ) has been rejected. ";
                  notifySender(x, sender.getId(), txn.getId(), notificationBody, "Transaction failed");

                }
              }
              DAO alarmDAO = (DAO) x.get("alarmDAO");
              Alarm alarm = (Alarm) alarmDAO.find_(x, new Alarm("ExchangeServer"));
              if ( alarm != null &&
                   alarm.getIsActive() ) {
                alarm = (Alarm) alarm.fclone();
                alarm.setIsActive(false);
                alarmDAO.put_(x, alarm);
              }
            } catch ( Throwable t ) {
              Logger logger = (Logger) x.get("logger");

              Throwable cause = t.getCause();
              while ( cause != null ) {
                if ( cause instanceof java.net.ConnectException ) {
                  // timeout - do nothing.
                  ((DAO) x.get("alarmDAO")).put_(x, new Alarm("ExchangeService", AlarmReason.TIMEOUT));
                  txn.getTransactionEvents(x).put_(x, new TransactionEvent("ExchangeService timeout"));
                  break;
                }
                cause = cause.getCause();
              }
              if ( cause == null) {
                cause = t.getCause(); // thrown is RuntimeException
                logger.error("Failed updating exchange limit transaction status", cause);
                txn.setStatus(TransactionStatus.FAILED);
                txn.getTransactionEvents(x).put_(x, new TransactionEvent(cause.getMessage()));
                txnDAO.put(txn);
              }
            }
          }
        }, "Exchange Limit Transaction");
      `
    },
    {
      name: 'checkExchangeLimit',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'Transaction' },
        { name: 'sender', type: 'User' }
      ],
      javaCode: `
        TrevisoService trevisoService = (TrevisoService) x.get("trevisoService");
        var limit = trevisoService.getTransactionLimit(sender.getId());
        var spotRate = new SpotRate.Builder(x)
          .setSourceCurrencyExpr(Transaction.SOURCE_CURRENCY)
          .setDestinationCurrencyExpr(new Constant("USD"))
          .build();
        var totalSourceAmount = -txn.getTotal(x, txn.getSourceAccount());
        return limit >= totalSourceAmount * spotRate.getRate(txn).doubleValue();
      `
    },
    {
      name: 'notifySender',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'Long',
          name: 'senderId'
        },
        {
          type: 'String',
          name: 'txnId',
        },
        {
          type: 'String',
          name: 'body'
        },
        {
          type: 'String',
          name: 'notificationType'
        }
      ],
      javaCode: `
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        Notification notifySender = new Notification();
        notifySender.setUserId(senderId);
        notifySender.setBody(body);
        notifySender.setNotificationType(notificationType);
        notificationDAO.put(notifySender);
      `
    },
    {
      name: 'notifyAgent',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'String',
          name: 'groupId'
        },
        {
          type: 'String',
          name: 'txnId',
        },
        {
          type: 'String',
          name: 'body'
        },
        {
          type: 'String',
          name: 'notificationType'
        }
      ],
      javaCode: `
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        Notification notifyAgent = new Notification();
        notifyAgent.setGroupId(groupId);
        notifyAgent.setBody(body);
        notifyAgent.setNotificationType(notificationType);
        notificationDAO.put(notifyAgent);
      `
    }
  ]
});
