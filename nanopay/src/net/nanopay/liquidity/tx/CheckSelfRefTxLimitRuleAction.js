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
  package: 'net.nanopay.liquidity.tx',
  name: 'CheckSelfRefTxLimitRuleAction',
  extends: 'net.nanopay.liquidity.ruler.CheckSelfRefAction',

  documentation: `TxLimitRule self reference check action.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.auth.User',
    'foam.nanos.dao.Operation',
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
        if ( approvable.getOperation() == Operation.CREATE ){
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

