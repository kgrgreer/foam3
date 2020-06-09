/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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

