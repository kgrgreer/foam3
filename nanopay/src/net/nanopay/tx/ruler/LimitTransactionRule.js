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
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Subject',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.account.Account',
    'net.nanopay.tx.CurrentLimit',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionLimit',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.ruler.TransactionLimitState',
    'net.nanopay.util.Frequency',
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

            boolean limitHit = false;

            if ( userLimits.size() > 0 ) {
              // check transaction limits on user
              for ( TransactionLimit limit : userLimits ) {
                limitHit = checkLimit(x, txn, limit, user);
              }
            } else if ( realUserLimits.size() > 0 ) {
              // check transaction limits on realUser
              for ( TransactionLimit limit : realUserLimits ) {
                limitHit = checkLimit(x, txn, limit, realUser);
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
                  limitHit = checkLimit(x, txn, limit, sourceOwner);
                }
              }
            }

            if ( ! limitHit ) {
              txn.setStatus(TransactionStatus.COMPLETED);
            }

          }
        }, "LimitTransactionRule");
      `
    },
    {
      name: 'generateApprovalRequest',
      type: 'Boolean',
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
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        List<ApprovalRequest> existingRequests = ((ArraySink) approvalRequestDAO.where(
          AND(
            EQ(ApprovalRequest.CLASSIFICATION_ENUM, ApprovalRequestClassificationEnum.TRANSACTION_LIMIT_EXCEEDED),
            EQ(ApprovalRequest.DAO_KEY, "transactionDAO"),
            EQ(ApprovalRequest.OBJ_ID, txn.getId())
          )
        ).select(new ArraySink())).getArray();

        if ( existingRequests.size() > 0 ) {
          // complete or cancel transaction if request is approved or rejected
          ApprovalRequest req = (ApprovalRequest) existingRequests.get(0);
          if ( req.getStatus().equals(ApprovalStatus.APPROVED) ) {
            return false;
          } else if ( req.getStatus().equals(ApprovalStatus.REJECTED) ) {
            txn.setStatus(TransactionStatus.CANCELLED);
            return true;
          }
        }

        // create new approval request if none exist
        ApprovalRequest req = new ApprovalRequest.Builder(x)
          .setClassificationEnum(ApprovalRequestClassificationEnum.TRANSACTION_LIMIT_EXCEEDED)
          .setDescription("Transaction ID: " + txn.getId() + " has exceeded " + limit.getPeriod().getLabel() + " limit of " + limit.getAmount())
          .setDaoKey("transactionDAO")
          .setServerDaoKey("localTransactionDAO")
          .setObjId(txn.getId())
          .setGroup(user.getGroup())
          .setCreatedFor(user.getId())
          .setStatus(ApprovalStatus.REQUESTED).build();
        approvalRequestDAO.put(req);
        return true;
      `
    },
    {
      name: 'checkLimit',
      type: 'Boolean',
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
        DAO currentLimitDAO = (DAO) x.get("localCurrentLimitDAO");
        if ( txn.getAmount() > limit.getAmount() ) {
          // txn already exceeds limit, generate approval request
          return generateApprovalRequest(x, txn, limit, user);
        }

        // check for current limits related to transaction limit
        List<CurrentLimit> currentLimits = ((ArraySink) currentLimitDAO.where(
          EQ(CurrentLimit.TX_LIMIT, limit.getId())
        ).select(new ArraySink())).getArray();
        
        if ( currentLimits.size() > 0 ) {
          // if current limits exist fetch transaction limit state and check limit
          CurrentLimit currentLimit = (CurrentLimit) currentLimits.get(0);
          String key = getKey(user, currentLimit);
          TransactionLimitState limitState = (TransactionLimitState) currentLimit.getCurrentLimits().get(key);
          if ( limitState == null ) {
            limitState = new TransactionLimitState();
            currentLimit.getCurrentLimits().put(key, limitState);
          }
          if ( ! limitState.check(limit.getAmount(), currentLimit.getPeriod(), txn.getAmount())) {
            // transaction exceeds limit generate approval request
            return generateApprovalRequest(x, txn, limit, user);
          } else {
            // if transaction doesnt exceed limit update limitState and currentLimit
            limitState.updateSpent(txn.getAmount(), currentLimit.getPeriod());
            currentLimit.getCurrentLimits().put(key, limitState);
            currentLimitDAO.put(currentLimit);
          }
        } else {
          // create new CurrentLimit if none exist
          CurrentLimit currentLimit = new CurrentLimit();
          currentLimit.setTxLimit(limit.getId());
          currentLimit.setPeriod(limit.getPeriod());
        
          String key = getKey(user, currentLimit);
          TransactionLimitState limitState = new TransactionLimitState();
          limitState.updateSpent(txn.getAmount(), limit.getPeriod());
          Map<String, TransactionLimitState> limitStateMap = new HashMap<>();
          limitStateMap.put(key, limitState);
          currentLimit.setCurrentLimits(limitStateMap);
          currentLimitDAO.put(currentLimit);
        }
        return false;
      `
    },
    {
      name: 'getKey',
      type: 'String',
      args: [
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'currentLimit',
          type: 'net.nanopay.tx.CurrentLimit'
        }
      ],
      javaCode: `
        // Build the transaction limit state key from the currentLimit configuration
        StringBuilder sb = new StringBuilder();
        sb.append("currentLimit:")
          .append(user.getId())
          .append(":")
          .append(currentLimit.getPeriod());
        return sb.toString();
      `
    }
  ]
});
