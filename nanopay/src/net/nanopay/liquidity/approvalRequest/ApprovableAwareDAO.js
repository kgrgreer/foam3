foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'ApprovableAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Map',
    'java.util.List',
    'foam.mlang.MLang',
    'foam.mlang.MLang.*',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.nanos.logger.Logger',
    'foam.lib.PropertyPredicate',
    'net.nanopay.account.Account',
    'foam.nanos.ruler.Operations',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.LifecycleAware',
    'foam.mlang.predicate.Predicate',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.liquidity.approvalRequest.Approvable',
    'net.nanopay.liquidity.approvalRequest.ApprovableAware',
    'net.nanopay.liquidity.approvalRequest.AccountApprovableAware',
    'net.nanopay.liquidity.approvalRequest.RoleApprovalRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    {
      name: 'sendSingleRequest',
      type: 'void',
      args: [
        { name: 'x', type: 'X' },
        { name: 'req', type: 'RoleApprovalRequest' },
        { name: 'userId', type: 'long' }
      ],
      javaCode: `
        RoleApprovalRequest request = (RoleApprovalRequest) req.fclone();
        request.clearId();
        request.setApprover(userId);
        ((DAO) x.get("approvalRequestDAO")).put_(x, request);
      `
    },
    {
      name: 'fullSend',
      type: 'void',
      args: [
        { name: 'x', type: 'X' },
        { name: 'request', type: 'RoleApprovalRequest' },
        { name: 'obj', type: 'FObject' }
      ],
      javaCode:`
      /**
        TODO: REIMPLEMENT WITH CRUNCH
        DAO requestingDAO;

        if ( request.getDaoKey().equals("approvableDAO") ){
          DAO approvableDAO = (DAO) x.get("approvableDAO");

          Approvable approvable = (Approvable) approvableDAO.find(request.getObjId());

          requestingDAO = (DAO) x.get(approvable.getDaoKey());
        } else {
          requestingDAO = (DAO) x.get(request.getDaoKey());
        }

        DAO accountDAO = (DAO) x.get("accountDAO");

        String modelName = requestingDAO.getOf().getObjClass().getSimpleName();
        Account outgoingAccount = (Account) accountDAO.find(outgoingAccountId);

        Boolean isGlobalRole = true;
        List<Role> baseRoles;
        Role baseRole;
        DAO approverDAO;

        // TODO: REDO DAOS after configuring services and connecting with CRUNCH
        switch(modelName){
            case "User":
              // there should be only one of each base role but we include this incase the id changes or duplicate names are used
              baseRoles = ((ArraySink) roleDAO.where(
                MLang.AND(
                  MLang.EQ(GlobalRole.DAO_KEY, "userDAO"),
                  MLang.EQ(Role.BASE_ROLE_TYPE, BaseRoleTypes.APPROVER)
                )
              ).select(new ArraySink())).getArray();

              baseRole = baseRoles.get(0);

              approverDAO = roleAssignmentTrunctionDAO.where(
                MLang.AND(
                  MLang.EQ(RoleAssignmentTrunction.ACCOUNT_ID, 0),
                  MLang.EQ(RoleAssignmentTrunction.ROLE_ID, baseRole.getId())
                )
              );
              break;
            case "LiquiditySettings":
              // see above
              baseRoles = ((ArraySink) roleDAO.where(
                MLang.AND(
                  MLang.EQ(GlobalRole.DAO_KEY, "liquiditySettingsDAO"),
                  MLang.EQ(Role.BASE_ROLE_TYPE, BaseRoleTypes.APPROVER)
                )
              ).select(new ArraySink())).getArray();

              baseRole = baseRoles.get(0);

              approverDAO = roleAssignmentTrunctionDAO.where(
                MLang.AND(
                  MLang.EQ(RoleAssignmentTrunction.ACCOUNT_ID, 0),
                  MLang.EQ(RoleAssignmentTrunction.ROLE_ID, baseRole.getId())
                )
              );
              break;
            case "Rule":
              // see above
              baseRoles = ((ArraySink) roleDAO.where(
                MLang.AND(
                  MLang.EQ(GlobalRole.DAO_KEY, "ruleDAO"),
                  MLang.EQ(Role.BASE_ROLE_TYPE, BaseRoleTypes.APPROVER)
                )
              ).select(new ArraySink())).getArray();

              baseRole = baseRoles.get(0);

              approverDAO = roleAssignmentTrunctionDAO.where(
                MLang.AND(
                  MLang.EQ(RoleAssignmentTrunction.ACCOUNT_ID, 0),
                  MLang.EQ(RoleAssignmentTrunction.ROLE_ID, baseRole.getId())
                )
              );
              break;
            case "RoleRequest":
              // see above
              baseRoles = ((ArraySink) roleDAO.where(
                MLang.AND(
                  MLang.EQ(GlobalRole.DAO_KEY, "roleRequestDAO"),
                  MLang.EQ(Role.BASE_ROLE_TYPE, BaseRoleTypes.APPROVER)
                )
              ).select(new ArraySink())).getArray();

              baseRole = baseRoles.get(0);

              approverDAO = roleAssignmentTrunctionDAO.where(
                MLang.AND(
                  MLang.EQ(RoleAssignmentTrunction.ACCOUNT_ID, 0),
                  MLang.EQ(RoleAssignmentTrunction.ROLE_ID, baseRole.getId())
                )
              );
              break;
            default:
              approverDAO = null;
          default:
            approverDAO = null;
        }
        
        if ( approverDAO != null ){
          // makers cannot approve their own requests even if they are an approver for the account
          // however they will receive an approvalRequest which they can only view and not approve or reject
          // so that they can keep track of the status of their requests
          sendSingleAccountRequest(x, accountRequest, request.getInitiatingUser());

          // TODO: 
          approverDAO.where(MLang.NEQ( UserCapabilityJunction.SOURCE_ID, request.getInitiatingUser() )).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              sendSingleRequest(x, request, ((UserCapabilityJunction) obj).getSourceId());
            }
          });
        }
       */
      `
    },
    {
      name: 'remove_',
      javaCode: `
        User user = (User) x.get("user");

        // system and admins override the approval process
        if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return super.remove_(x,obj);

        ApprovableAware approvableAwareObj = (ApprovableAware) obj;
        DAO approvalRequestDAO = ((DAO) getX().get("approvalRequestDAO"));

        List approvedObjRemoveRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvableAwareObj.getKey()),
              foam.mlang.MLang.EQ(RoleApprovalRequest.OPERATION, Operations.REMOVE),
              foam.mlang.MLang.OR(
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
              )
            )
          ).select(new ArraySink())).getArray();

        if ( approvedObjRemoveRequests.size() == 1 ){
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjRemoveRequests.get(0);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ){
            return super.put_(x,obj);
          } 
          
          return null;  // as request has been REJECTED
        } 
        
        if ( approvedObjRemoveRequests.size() > 1 ){
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        } 

        RoleApprovalRequest approvalRequest = new RoleApprovalRequest.Builder(getX())
          .setDaoKey(getDaoKey())
          .setObjId(approvableAwareObj.getKey())
          // .setOutgoingAccount(approvableAwareObj.getOutgoingAccount(getX()))
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.REMOVE)
          .setInitiatingUser(((User) x.get("user")).getId())
          .setStatus(ApprovalStatus.REQUESTED).build(); 

        fullSend(getX(), approvalRequest, obj);

        // we need to prevent the remove_ call from being passed all the way down to actual deletion since
        // we are just creating the approval requests for deleting the object as of now
        return null;
      `
    },
    {
      name: 'put_',
      javaCode: `
      User user = (User) x.get("user");

      // system and admins override the approval process
      if ( user != null && ( user.getId() == User.SYSTEM_USER_ID || user.getGroup().equals("admin") || user.getGroup().equals("system") ) ) return super.put_(x,obj);

      DAO approvalRequestDAO = (DAO) getX().get("approvalRequestDAO");
      DAO dao = (DAO) getX().get(getDaoKey());

      ApprovableAware approvableAwareObj = (ApprovableAware) obj;
      LifecycleAware lifecycleObj = (LifecycleAware) obj;
      FObject currentObjectInDAO = (FObject) dao.find(approvableAwareObj.getKey());
      
      if ( obj instanceof LifecycleAware && ((LifecycleAware) obj).getLifecycleState() == LifecycleState.DELETED ){
        approvableAwareObj = (ApprovableAware) currentObjectInDAO;
          
        List approvedObjRemoveRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvableAwareObj.getKey()),
              foam.mlang.MLang.EQ(RoleApprovalRequest.OPERATION, Operations.REMOVE),
              foam.mlang.MLang.OR(
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
              )
            )
          ).select(new ArraySink())).getArray();

        if ( approvedObjRemoveRequests.size() == 1 ){
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjRemoveRequests.get(0);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ){
            return super.put_(x,obj);
          } 
          
          return null;  // as request has been REJECTED
        } 
        
        if ( approvedObjRemoveRequests.size() > 1 ){
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        } 

        RoleApprovalRequest approvalRequest = new RoleApprovalRequest.Builder(getX())
          .setDaoKey(getDaoKey())
          .setObjId(approvableAwareObj.getKey())
          // .setOutgoingAccount(approvableAwareObj.getOutgoingAccount(getX()))
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.REMOVE)
          .setInitiatingUser(((User) x.get("user")).getId())
          .setStatus(ApprovalStatus.REQUESTED).build();

        fullSend(getX(), approvalRequest, obj);

        return null;  // we aren't updating the object to deleted just yet
      }

      if ( currentObjectInDAO == null || ((LifecycleAware) currentObjectInDAO).getLifecycleState() == LifecycleState.PENDING ){
        List approvedObjCreateRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, getDaoKey()),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvableAwareObj.getKey()),
              foam.mlang.MLang.EQ(RoleApprovalRequest.OPERATION, Operations.CREATE),
              foam.mlang.MLang.OR(
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
              )
            )
          ).select(new ArraySink())).getArray();

        if ( approvedObjCreateRequests.size() == 1 ){
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjCreateRequests.get(0);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ){
            lifecycleObj.setLifecycleState(LifecycleState.ACTIVE);
            return super.put_(x,obj);
          } 
          
          // create request has been rejected is only where we mark the account as REJECTED
          lifecycleObj.setLifecycleState(LifecycleState.REJECTED);
          return super.put_(x,obj); 
        } 
        
        if ( approvedObjCreateRequests.size() > 1 ){
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        } 

        RoleApprovalRequest approvalRequest = new RoleApprovalRequest.Builder(getX())
          .setDaoKey(getDaoKey())
          .setObjId(approvableAwareObj.getKey())
          // .setOutgoingAccount(approvableAwareObj.getOutgoingAccount(getX()))
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.CREATE)
          .setInitiatingUser(((User) x.get("user")).getId())
          .setStatus(ApprovalStatus.REQUESTED).build();

        fullSend(getX(), approvalRequest, obj);

        // we are storing the object in it's related dao with a lifecycle state of PENDING
        return super.put_(x,obj);

      } else {
        // then handle the diff here and attach it into the approval request
        Map updatedProperties = currentObjectInDAO.diff(obj);

        // change last modified by to be the user
        updatedProperties.put("lastModifiedBy", ((User) x.get("user")).getId());
        DAO approvableDAO = (DAO) getX().get("approvableDAO");

        ApprovableId approvableId = new ApprovableId.Builder(getX())
          .setDaoKey(getDaoKey())
          .setPropertiesToUpdate(updatedProperties)
          .setObjId(approvableAwareObj.getKey())
          .build();

        List approvedObjUpdateRequests = ((ArraySink) approvalRequestDAO
          .where(
            foam.mlang.MLang.AND(
              foam.mlang.MLang.EQ(ApprovalRequest.DAO_KEY, "approvableDAO"),
              foam.mlang.MLang.EQ(ApprovalRequest.OBJ_ID, approvableId),
              foam.mlang.MLang.EQ(RoleApprovalRequest.OPERATION, Operations.UPDATE),
              foam.mlang.MLang.OR(
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED),
                foam.mlang.MLang.EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED)
              )
            )
          ).select(new ArraySink())).getArray();

        if ( approvedObjUpdateRequests.size() == 1 ){
          ApprovalRequest fulfilledRequest = (ApprovalRequest) approvedObjUpdateRequests.get(0);

          if ( fulfilledRequest.getStatus() == ApprovalStatus.APPROVED ){
            return super.put_(x,obj);
          }

          return null; // as request has been REJECTED
        }

        if ( approvedObjUpdateRequests.size() > 1 ){
          throw new RuntimeException("Something went wrong cannot have multiple approved/rejected requests for the same request!");
        }

        Approvable approvable = (Approvable) approvableDAO.put_(getX(), new Approvable.Builder(getX())
          .setDaoKey(getDaoKey())
          .setStatus(ApprovalStatus.REQUESTED)
          .setObjId(approvableAwareObj.getKey())
          .setPropertiesToUpdate(updatedProperties).build());

        RoleApprovalRequest approvalRequest = new RoleApprovalRequest.Builder(getX())
          .setDaoKey("approvableDAO")
          .setObjId(approvable.getId())
          // .setOutgoingAccount(approvableAwareObj.getOutgoingAccount(getX()))
          .setClassification(getOf().getObjClass().getSimpleName())
          .setOperation(Operations.UPDATE)
          .setInitiatingUser(((User) x.get("user")).getId())
          .setStatus(ApprovalStatus.REQUESTED).build();

        fullSend(getX(), approvalRequest, obj);

        return null; // we aren't updating the object just yet
      }
      `
    }
  ]
});
