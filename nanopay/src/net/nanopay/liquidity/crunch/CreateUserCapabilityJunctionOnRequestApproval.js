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
    'net.nanopay.liquidity.tx.AccountHierarchy',
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
            DAO userCapabilityJunctionDAO = (DAO) getX().get("userCapabilityJunctionDAO");
            DAO capabilityDAO = (DAO) getX().get("capabilityDAO");
            DAO capabilityAccountTemplateDAO = (DAO) getX().get("capabilityAccountTemplateDAO");

            CapabilityRequest req = (CapabilityRequest) obj;
            CapabilityRequestOperations requestType = req.getRequestType();
            
            List<Long> users = req.getUsers();
            LiquidCapability capability;

            if ( requestType == CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
              capability = (LiquidCapability) capabilityDAO.find(req.getAccountBasedCapability());

              CapabilityAccountTemplate template = (CapabilityAccountTemplate) capabilityAccountTemplateDAO.find(req.getCapabilityAccountTemplate());
              AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchy");

              AccountApproverMap fullAccountMap = accountHierarchy.getAccountsFromCapabilityAccountTemplate(getX(), template);

              UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).build();

              ucj.setData(fullAccountMap);

              for ( Long userId : users ) {
                ucj.setSourceId(userId);
                ucj.setTargetId(capability.getId());
                userCapabilityJunctionDAO.put_(getX(), ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.ASSIGN_GLOBAL ) {
              capability = (LiquidCapability) capabilityDAO.find(req.getGlobalCapability());

              ApproverLevel approverLevel = new net.nanopay.liquidity.crunch.ApproverLevel.Builder(x).setApproverLevel(req.getApproverLevel()).build();
              UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).build();

              ucj.setData(approverLevel);

              for ( Long userId : users ) {
                ucj.setSourceId(userId);
                ucj.setTargetId(capability.getId());
                userCapabilityJunctionDAO.put_(getX(), ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
              capability = (LiquidCapability) capabilityDAO.find(req.getAccountBasedCapability());

              CapabilityAccountTemplate template = (CapabilityAccountTemplate) capabilityAccountTemplateDAO.find(req.getCapabilityAccountTemplate());
              AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchy");

              AccountApproverMap fullAccountMap = accountHierarchy.getAccountsFromCapabilityAccountTemplate(getX(), template);

              UserCapabilityJunction ucj;

              for ( Long userId : users ) {
                ucj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
                  EQ(UserCapabilityJunction.SOURCE_ID, userId),
                  EQ(UserCapabilityJunction.TARGET_ID, capability.getId())
                ));

                AccountApproverMap map = (AccountApproverMap) ucj.getData();

                if ( map == null || map.getAccounts() == null ) {
                  throw new RuntimeException("map does not contain account to revoke from");
                }

                for ( String accountId : fullAccountMap.getAccounts().keySet() ){
                  map.removeAccount(Long.parseLong(accountId));
                }

                if ( map.getAccounts().size() == 0 ) {
                  userCapabilityJunctionDAO.remove_(getX(), ucj);
                } else {
                  ucj.setData(map);
                  userCapabilityJunctionDAO.put_(getX(), ucj);
                }
              }
            } else if ( requestType == CapabilityRequestOperations.REVOKE_GLOBAL ) {
              capability = (LiquidCapability) capabilityDAO.find(req.getGlobalCapability());

              for ( Long userId : users ) {

                userCapabilityJunctionDAO.remove((UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
                  EQ(UserCapabilityJunction.SOURCE_ID, userId),
                  EQ(UserCapabilityJunction.TARGET_ID, capability.getId())
                )));
              }
            } else {
              throw new RuntimeException("Invalid CapabilityRequest type");
            }
          }
        }, "Create UserCapabilityJunction on CapabilityRequest Approval");
      `
    }
  ]
});



foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApprovedCapabilityRequestPredicate',

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
          EQ(DOT(NEW_OBJ, CapabilityRequest.LIFECYCLE_STATE), LifecycleState.ACTIVE)
        .f(obj);
      `
    } 
  ]
});
