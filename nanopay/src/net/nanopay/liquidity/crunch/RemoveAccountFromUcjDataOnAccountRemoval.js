foam.CLASS({
    package: 'net.nanopay.liquidity.crunch',
    name: 'RemoveAccountFromUcjDataOnAccountRemoval',
  
    documentation: 'Rule to remove account from ucj data on account removal',
  
    implements: [
      'foam.nanos.ruler.RuleAction'
    ],
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.nanos.auth.LifecycleAware',
      'foam.nanos.crunch.UserCapabilityJunction',
      'java.util.HashMap',
      'java.util.List',
      'java.util.Map',
      'net.nanopay.account.Account',
      'net.nanopay.liquidity.tx.AccountHierarchy'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ((LifecycleAware) obj).getLifecycleState() == foam.nanos.auth.LifecycleState.DELETED ) {
              DAO dao = (DAO) x.get("userCapabilityJunctionDAO");
              AccountHierarchy service = (AccountHierarchy) x.get("accountHierarchyService");

              String id = String.valueOf(((Account) obj).getId());

              List<UserCapabilityJunction> list= ((ArraySink) dao
                .select(new ArraySink()))
                .getArray();

              for ( UserCapabilityJunction ucj : list ) {
                if ( ucj.getData() instanceof AccountApproverMap ) {
                  AccountApproverMap map = (AccountApproverMap) ucj.getData();

                  if ( map.getAccounts() != null && map.getAccounts().containsKey(id) ) {
                    Map<String, CapabilityAccountData> oldMap = map.getAccounts();
                    oldMap.remove(id);
                    map.setAccounts(oldMap);
                    ucj.setData(map);
                    dao.put(ucj);

                    service.removeRootFromUser(x, ucj.getSourceId(), ((Account) obj).getId());
                  }
                }
              }
            }
          }
        }, "Remove accounts from ucjdata on account removal");
        `
      }
    ]
  });