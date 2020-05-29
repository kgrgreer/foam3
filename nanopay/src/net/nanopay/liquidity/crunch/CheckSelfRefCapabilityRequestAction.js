foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CheckSelfRefCapabilityRequestAction',
  extends: 'net.nanopay.liquidity.ruler.CheckSelfRefAction',

  documentation: `CapabilityRequest self reference check action.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.auth.User',
    'foam.nanos.ruler.Operations',
    'foam.util.SafetyUtil',
    'java.util.HashSet',
    'java.util.List',
    'java.util.Map',
    'java.util.Set'
  ],

  methods: [
    {
      name: 'getReferencedUsers',
      javaCode: `
        List<Long> users = null;
        if ( approvable.getOperation() == Operations.CREATE ){
          Map propsToUpdate = approvable.getPropertiesToUpdate();  
          if ( ! propsToUpdate.containsKey(CapabilityRequest.USERS.getName()) )
            return new HashSet<Long>();
          users = (List<Long>) propsToUpdate.get(CapabilityRequest.USERS.getName());
        } else { // UPDATE
          DAO serverDao = (DAO) x.get(approvable.getServerDaoKey());
          CapabilityRequest request = (CapabilityRequest) serverDao.inX(getX()).find(approvable.getObjId());
          if ( request == null )
            return new HashSet<Long>();
          users = request.getUsers();
        }
        return ( users != null ) ? new HashSet<Long>(users) : new HashSet<Long>();
      `
    },
    {
      name: 'getReferencedUsersOnDelete',
      javaCode: `
        Set<Long> referencedUserSet = new HashSet<Long>();
        if ( obj == null )
          return referencedUserSet;

        CapabilityRequest request = (CapabilityRequest) obj;
        if ( request == null || request.getUsers() == null )
          return referencedUserSet;

        return new HashSet<Long>(request.getUsers());
      `
    }
  ]
});

