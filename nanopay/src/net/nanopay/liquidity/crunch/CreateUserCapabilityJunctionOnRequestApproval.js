foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CreateUserCapabilityJunctionOnRequestApproval',

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Map',
    'java.util.HashMap',
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
            DAO capabilityDAO = (DAO) getX().get("localCapabilityDAO");
            DAO capabilityAccountTemplateDAO = (DAO) getX().get("capabilityAccountTemplateDAO");

            CapabilityRequest req = (CapabilityRequest) obj;
            CapabilityRequestOperations requestType = req.getRequestType();
            
            List<Long> users = req.getUsers();
            LiquidCapability capability;

            if ( requestType == CapabilityRequestOperations.ASSIGN_ACCOUNT_BASED ) {
              capability = (AccountBasedLiquidCapability) capabilityDAO.find(req.getAccountBasedCapability());

              CapabilityAccountTemplate template;
              if ( req.getIsUsingTemplate() ) { 
                template = (CapabilityAccountTemplate) capabilityAccountTemplateDAO.find(req.getCapabilityAccountTemplate());
              } else { 
                CapabilityAccountData data = new CapabilityAccountData.Builder(x)
                  .setIsCascading(false)
                  .setIsIncluded(true)
                  .setApproverLevel(new ApproverLevel.Builder(x).setApproverLevel(req.getApproverLevel()).build())
                  .build();
                Map<String, CapabilityAccountData> map = new HashMap<String, CapabilityAccountData>();
                map.put(String.valueOf(req.getAccountToAssignTo()), data);

                template = new CapabilityAccountTemplate.Builder(x).setAccounts(map).build();
              }

              AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchy");

              for ( Long user : users )  {
                UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).setSourceId(user).setTargetId(capability.getId()).build();
                UserCapabilityJunction oldUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
                AccountApproverMap oldTemplate = ( oldUcj != null ) ? (AccountApproverMap) oldUcj.getData() : null;
                AccountApproverMap fullAccountMap = accountHierarchy.getAssignedAccountMap(x, ((AccountBasedLiquidCapability) capability).getCanViewAccount(), user, oldTemplate, template);
                ucj.setData(fullAccountMap);
                userCapabilityJunctionDAO.put(ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.ASSIGN_GLOBAL ) {
              capability = (GlobalLiquidCapability) capabilityDAO.find(req.getGlobalCapability());

              ApproverLevel approverLevel = new net.nanopay.liquidity.crunch.ApproverLevel.Builder(x).setApproverLevel(req.getApproverLevel()).build();
              UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).build();

              ucj.setData(approverLevel);

              for ( Long userId : users ) {
                ucj.setSourceId(userId);
                ucj.setTargetId(capability.getId());
                userCapabilityJunctionDAO.put_(getX(), ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.REVOKE_ACCOUNT_BASED ) {
              capability = (AccountBasedLiquidCapability) capabilityDAO.find(req.getAccountBasedCapability());

              CapabilityAccountTemplate template;
              if ( req.getIsUsingTemplate() ) { 
                template = (CapabilityAccountTemplate) capabilityAccountTemplateDAO.find(req.getCapabilityAccountTemplate());
              } else { 
                CapabilityAccountData data = new CapabilityAccountData.Builder(x)
                  .setIsCascading(false)
                  .setIsIncluded(true)
                  .build();
                Map<String, CapabilityAccountData> map = new HashMap<String, CapabilityAccountData>();
                map.put(String.valueOf(req.getAccountToAssignTo()), data);
                
                template = new CapabilityAccountTemplate.Builder(x).setAccounts(map).build();
              }

              AccountHierarchy accountHierarchy = (AccountHierarchy) getX().get("accountHierarchy");

              for ( Long user : users )  {
                UserCapabilityJunction ucj = new UserCapabilityJunction.Builder(x).setSourceId(user).setTargetId(capability.getId()).build();
                UserCapabilityJunction oldUcj = (UserCapabilityJunction) userCapabilityJunctionDAO.find(ucj.getId());
                AccountApproverMap oldTemplate = ( oldUcj != null ) ? (AccountApproverMap) oldUcj.getData() : null;
                AccountApproverMap fullAccountMap = accountHierarchy.getRevokedAccountsMap(x, ((AccountBasedLiquidCapability) capability).getCanViewAccount(), user, oldTemplate, template);
                ucj.setData(fullAccountMap);
                userCapabilityJunctionDAO.put(ucj);
              }
            } else if ( requestType == CapabilityRequestOperations.REVOKE_GLOBAL ) {
              capability = (GlobalLiquidCapability) capabilityDAO.find(req.getGlobalCapability());

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
