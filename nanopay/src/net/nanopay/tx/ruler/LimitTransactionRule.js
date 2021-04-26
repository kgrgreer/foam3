/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx.ruler',
  name: 'LimitTransactionRule',

  documentation: 'Looks up any limit types related to the current transaction.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.CurrentLimit',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionLimit',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Transaction txn = (Transaction) obj;
            DAO accountDAO = (DAO) x.get("localAccountDAO");
            DAO transactionLimitDAO = (DAO) x.get("transactionLimitDAO");
            DAO userDAO = (DAO) x.get("localUserDAO");
            
            User user = ((Subject) x.get("subject")).getUser();
            User realUser = ((Subject) x.get("subject")).getRealUser();

            List<TransactionLimit> userLimits = ((ArraySink) transactionLimitDAO.where(
              EQ(TransactionLimit.USER_ID, user.getId())
            ).select(new ArraySink())).getArray();

            List<TransactionLimit> realUserLimits = ((ArraySink) transactionLimitDAO.where(
              EQ(TransactionLimit.USER_ID, realUser.getId())
            ).select(new ArraySink())).getArray();

            if ( userLimits.size() > 0 ) {
              // check transaction limits on user
              for ( TransactionLimit limit : userLimits ) {
                checkLimit(x, txn, limit, user);
              }
            } else if ( realUserLimits.size() > 0 ) {
              // check transaction limits on realUser
              for ( TransactionLimit limit : realUserLimits ) {
                checkLimit(x, txn, limit, realUser);
              }
            } else {
              // check transaction limits on spid
              Account sourceAccount = (Account) accountDAO.find(txn.getSourceAccount());
              User sourceOwner = (User) userDAO.find(sourceAccount.getOwner());

              List<TransactionLimit> spidLimits = ((ArraySink) transactionLimitDAO.where(
                EQ(TransactionLimit.SPID, sourceOwner.getSpid())
              ).select(new ArraySink())).getArray();

              if ( spidLimits.size() > 0 ) {
                for ( TransactionLimit limit : spidLimits ) {
                  checkLimit(x, txn, limit, sourceOwner);
                }
              }
            }
          }
        }, "LimitTransactionRule");
      `
    },
    {
      name: 'generateApprovalRequest',
      type: 'Void',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'txn'
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimit',
          name: 'limit'
        },
        {
          type: 'foam.nanos.auth.User',
          name: 'user'
        }
      ],
      javaCode: `
        ApprovalRequest req = new ApprovalRequest.Builder(x)
          .setClassification("Transaction Limit Exceeded")
          .setDescription("Transaction ID: " + txn.getId() + " has exceeded " + limit.getTimeFrame().getLabel() + " limit of " + limit.getAmount())
          .setDaoKey("transactionDAO")
          .setServerDaoKey("localTransactionDAO")
          .setObjId(txn.getId())
          .setGroup(user.getGroup())
          .setCreatedFor(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();
        ((DAO) x.get("approvalRequestDAO")).put(req);
      `
    },
    {
      name: 'checkLimit',
      type: 'Void',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'txn'
        },
        {
          type: 'net.nanopay.tx.model.TransactionLimit',
          name: 'limit'
        },
        {
          type: 'foam.nanos.auth.User',
          name: 'user'
        }
      ],
      javaCode: `
        DAO currentLimitDAO = (DAO) x.get("currentLimitDAO");
        List<CurrentLimit> currentLimits = ((ArraySink) currentLimitDAO.where(
          EQ(CurrentLimit.TX_LIMIT, limit.getId())
        ).select(new ArraySink())).getArray();

        if ( txn.getAmount() > limit.getAmount() ) {
          // txn already exceeds spid limit, generate approval request
          generateApprovalRequest(x, txn, limit, user);
          return;
        }
        
        if ( currentLimits.size() > 0 ) {
          // check if currentLimit currentRunningValue exceeds limit amount
          // if doesnt exceed update currentRunningValue with transaction amount
          // if it does exceed create approval request

          CurrentLimit currentLimit = (CurrentLimit) currentLimits.get(0);
          Long runningValue = currentLimit.getCurrentRunningValue();
          Long totalAfterTxn = runningValue + txn.getAmount();
          if ( totalAfterTxn > limit.getAmount() ) {
            generateApprovalRequest(x, txn, limit, user);
          } else {
            currentLimit.setCurrentRunningValue(totalAfterTxn);
            currentLimitDAO.put(currentLimit);
          }
        } else {
          // create currentLimit with data from transaction limit

          CurrentLimit currentLimit = new CurrentLimit.Builder(x)
            .setTxLimit(limit.getId())
            .setType(limit.getType())
            .setTimeFrame(limit.getTimeFrame())
            .setCurrentRunningValue(txn.getAmount())
            .build();
          currentLimitDAO.put(currentLimit);
        }
      `
    }
  ]
});
