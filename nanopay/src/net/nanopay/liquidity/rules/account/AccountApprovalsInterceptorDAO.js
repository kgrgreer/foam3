foam.CLASS({
  package: 'net.nanopay.liquidity.rules.account',
  name: 'AccountApprovalsInterceptorDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.List',
    'foam.mlang.MLang',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.lib.PropertyPredicate',
    'net.nanopay.account.Account',
    'foam.nanos.ruler.Operations',
    'foam.mlang.predicate.Predicate',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.liquidity.LiquidApprovalRequest'
  ],

  methods: [
    {
      name: 'remove_',
      javaCode: `
        Account account = (Account) obj;
        DAO approvalRequestDAO = ((DAO) getX().get("approvalRequestDAO"));

        List objectApprovalRequestArray = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "localAccountDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, account.getId()),
              foam.mlang.MLang.EQ(LiquidApprovalRequest.OPERATION, Operations.REMOVE)
            )
          ).select(new ArraySink())).getArray();

        for ( int i = 0; i < objectApprovalRequestArray.size(); i++ ){
          ApprovalRequest request = (ApprovalRequest) objectApprovalRequestArray.get(i);
          if ( request.getStatus() == ApprovalStatus.APPROVED ){
            return super.remove_(x,obj);
          }

          if ( request.getStatus() == ApprovalStatus.REJECTED ){
            // we are preventing the remove_ call from actually deleting the object since it the request was rejected
            return null;
          }
        }
        
        if ( objectApprovalRequestArray.size() > 1 ){
          Logger logger = (Logger) x.get("logger");
          logger.error("You cannot submit a pending approval request that already exists");
          throw new RuntimeException("You cannot submit a pending approval request that already exists");
        }

        if ( objectApprovalRequestArray.size() == 1 ){

          ApprovalRequest fulfilledApprovalRequest = (ApprovalRequest) objectApprovalRequestArray.get(0);

          if ( fulfilledApprovalRequest.getStatus() == ApprovalStatus.REQUESTED ){
            Logger logger = (Logger) x.get("logger");
            logger.error("You cannot submit a pending approval request that already exists");
            throw new RuntimeException("You cannot submit a pending approval request that already exists");
          }
        }

        // at this point, no approval requests for this specific action exists and so we can create a request
        approvalRequestDAO.put_(getX(),
          new LiquidApprovalRequest.Builder(getX())
            .setDaoKey("localAccountDAO")
            .setObjId(account.getId())
            .setOutgoingAccount(account.getParent())
            .setClassification("Account")
            .setOperation(Operations.REMOVE)
            .setInitiatingUser(((User) x.get("user")).getId())
            .setStatus(ApprovalStatus.REQUESTED).build());

        // we need to prevent the remove_ call from being passed all the way down to actual deletion since
        // we are just creating the approval requests for deleting the object as of now
        return null;
      `
    },
    {
      name: 'put_',
      javaCode: `
      DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
      DAO localAccountDAO = (DAO) getX().get("localAccountDAO");

      Account account = (Account) obj;

      if ( account.getDeleted() == true ){

        // check if there is an approved removal request
        List approvedAccountDeleteRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "localAccountDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, account.getId()),
              foam.mlang.MLang.EQ(LiquidApprovalRequest.OPERATION, Operations.REMOVE),
              foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)
            )
          ).select(new ArraySink())).getArray();

        if ( approvedAccountDeleteRequests.size() > 0 ){
          return super.remove_(x,account);
        } else {
          // if there is none then we will create a request and exit from the decorators
          approvalRequestDAO.put_(getX(),
            new LiquidApprovalRequest.Builder(getX())
              .setDaoKey("localAccountDAO")
              .setObjId(account.getId())
              .setOutgoingAccount(account.getParent())
              .setClassification("Account")
              .setOperation(Operations.REMOVE)
              .setInitiatingUser(((User) x.get("user")).getId())
              .setStatus(ApprovalStatus.REQUESTED).build());

          // this will revert the account to having deleted as false
          return null;
        }
      }

      Account currentAccountInDAO = (Account) localAccountDAO.find(account.getId());

      if ( currentAccountInDAO != null && currentAccountInDAO.getEnabled() == true ){
        // then handle the diff here and attach it into the approval request
        Map updatedProperties = currentAccountInDAO.diff(account);

        // TODO: check if property is storage transient and remove it
        // remove balance and homeBalance
        updatedProperties.remove("balance");
        updatedProperties.remove("homeBalance");
        
        // check if there is an approved removal request
        List approvedAccountUpdateRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "localAccountDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, account.getId()),
              foam.mlang.MLang.EQ(LiquidApprovalRequest.OPERATION, Operations.UPDATE),
              foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
              foam.mlang.MLang.EQ(LiquidApprovalRequest.PROPERTIES_TO_UPDATE, updatedProperties)
            )
          ).select(new ArraySink())).getArray();

        if ( approvedAccountUpdateRequests.size() > 0 ){
          return super.put_(x,obj);
        }

        approvalRequestDAO.put_(getX(),
            new LiquidApprovalRequest.Builder(getX())
              .setDaoKey("localAccountDAO")
              .setObjId(account.getId())
              .setOutgoingAccount(account.getParent())
              .setClassification("Account")
              .setOperation(Operations.UPDATE)
              .setInitiatingUser(((User) x.get("user")).getId())
              .setPropertiesToUpdate(updatedProperties)
              .setStatus(ApprovalStatus.REQUESTED).build());

        return null; // we aren't updating the object just yet
      }

      // find the updates between obj and the current object in the DAO => this is for the create 
      return super.put_(x,obj);
      `
    }
  ]
});
