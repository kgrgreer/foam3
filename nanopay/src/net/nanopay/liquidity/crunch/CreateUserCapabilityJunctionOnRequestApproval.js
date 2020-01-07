foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CreateUserCapabilityJunctionOnRequestApproval',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.List',
    'net.nanopay.account.Account',
    'static foam.mlang.MLang.*'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            X systemX = x.put("user", new User.Builder(x).setId(User.SYSTEM_USER_ID).build());
            DAO userCapabilityJunctionDAO = ((DAO) x.get("userCapabilityJunctionDAO")).inX(systemX);

            CapabilityAssignmentRequest req = (CapabilityAssignmentRequest) obj;
            CapabilityRequestOperations requestType = req.getRequestType();
            
            List<User> users = req.getUsers();
            LiquidCapability capability = req.getCapability();

            if ( requestType == CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
              CapabilityAccountTemplate template = req.getCapabilityAccountTemplate();
              UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).build();
              ucj.setData(template);
              for ( User user : users ) {
                ucj.setSourceId(user.getId());
                ucj.setTargetId((String) capability.getId());
                userCapabilityJunctionDAO.put(ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.ASSIGN_GLOBAL ) {
              ApproverLevel approverLevel = new net.nanopay.liquidity.crunch.ApproverLevel.Builder(x).setApproverLevel(req.getApproverLevel()).build();
              UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).build();
              ucj.setData(approverLevel);
              for ( User user : users ) {
                ucj.setSourceId(user.getId());
                ucj.setTargetId((String) capability.getId());
                userCapabilityJunctionDAO.put(ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
              Account account = req.getAccount();
              UserCapabilityJunction ucj;
              for ( User user : users ) {
                ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
                  EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
                  EQ(UserCapabilityJunction.TARGET_ID, capability.getId())
                ));
                AccountApproverMap map = (AccountApproverMap) ucj.getData();
                if ( map == null || map.getAccounts() == null || ! map.hasAccount(systemX, account.getId()) ) {
                  throw new RuntimeException("map does not contain account to revoke from");
                }
                map.removeAccount(account.getId());
                if ( map.getAccounts().size() == 0 ) {
                  userCapabilityJunctionDAO.remove(ucj);
                } else {
                  ucj.setData(map);
                  userCapabilityJunctionDAO.put(ucj);
                }
              }

            } else if ( requestType == CapabilityRequestOperations.REVOKE_GLOBAL ) {
              for ( User user : users ) {

                userCapabilityJunctionDAO.remove((UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
                  EQ(UserCapabilityJunction.SOURCE_ID, user.getId()),
                  EQ(UserCapabilityJunction.TARGET_ID, capability.getId())
                )));
              }
            } else {
              throw new RuntimeException("Invalid CapabilityAssignmentRequest type");
            }
          }
        }, "Create UserCapabilityJunction on CapabilityAssignmentRequest Approval");
      `
    }
  ]
});



foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApprovedCapabilityAssignmentRequestPredicate',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.LifecycleState',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return
          EQ(DOT(NEW_OBJ, CapabilityAssignmentRequest.LIFECYCLE_STATE), LifecycleState.ACTIVE)
        .f(obj);
      `
    } 
  ]
});
  