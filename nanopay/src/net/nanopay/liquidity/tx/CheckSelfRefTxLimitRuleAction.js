foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'CheckSelfRefTxLimitRuleAction',
  extends: 'net.nanopay.liquidity.ruler.CheckSelfRefAction',

  documentation: `TxLimitRule self reference check action.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Operations',
    'foam.util.SafetyUtil',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set'
  ],

  methods: [
    {
      name: 'getReferencedUsers',
      javaCode: `
        Set<Long> referencedUserSet = new HashSet<Long>();
        if ( approvable.getOperation() == Operations.CREATE ){
          Map propsToUpdate = approvable.getPropertiesToUpdate();  
          if ( ! propsToUpdate.containsKey(TxLimitRule.USER_TO_LIMIT.getName()) )
            return referencedUserSet;
          referencedUserSet.add((Long) propsToUpdate.get(TxLimitRule.USER_TO_LIMIT.getName()));
        } else { // UPDATE
          DAO serverDao = (DAO) x.get(approvable.getServerDaoKey());
          TxLimitRule rule = (TxLimitRule) serverDao.inX(getX()).find(approvable.getObjId());
          if ( rule == null )
            return referencedUserSet;
          referencedUserSet.add(rule.getUserToLimit());
        }
        return referencedUserSet;
      `
    },
    {
      name: 'getReferencedUsersOnDelete',
      javaCode: `
        Set<Long> referencedUserSet = new HashSet<Long>();
        if ( obj == null )
          return referencedUserSet;

        TxLimitRule rule = (TxLimitRule) obj;
        if ( rule == null )
          return referencedUserSet;

        referencedUserSet.add(rule.getUserToLimit());
        return referencedUserSet;
      `
    }
  ]
});

