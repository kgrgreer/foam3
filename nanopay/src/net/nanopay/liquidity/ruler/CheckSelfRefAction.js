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
  package: 'net.nanopay.liquidity.ruler',
  name: 'CheckSelfRefAction',
  implements: ['foam.nanos.ruler.RuleAction'],
  abstract: true,

  documentation: `Action used to prevent user from approving a request that references them.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.dao.Operation',
    'foam.util.SafetyUtil',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set'
  ],

  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        // This action only works with ApprovalRequests
        ApprovalRequest approvalRequest = (ApprovalRequest) obj;

        // Get the DAO
        DAO dao = (DAO) x.get(approvalRequest.getDaoKey());
        if ( dao == null ) return;

        Set<Long> referencedUserSet = null;
        if ( approvalRequest.getOperation() == Operation.REMOVE ) {
          // Get the users being referenced
          referencedUserSet = getReferencedUsersOnDelete(x, dao.inX(getX()).find(approvalRequest.getObjId()));
        } else {
          // Try to find the record we are approving
          Approvable approvable = (Approvable) dao.inX(getX()).find(approvalRequest.getObjId());
          if ( approvable == null ) return;

          // Get the users being referenced
          referencedUserSet = getReferencedUsers(x, approvable);
        }
        if ( referencedUserSet == null || referencedUserSet.size() == 0 ) return;
        
        // Get the real user
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();

        // Check if the record refers to the current user
        if ( referencedUserSet.contains(user.getId()) )
          throw new RuntimeException(getMessage());
      `
    },
    {
      name: 'getReferencedUsers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'approvable', type: 'Approvable' }
      ],
      javaType: 'Set<Long>',
      javaCode: `
        return new HashSet<Long>();
      `
    },
    {
      name: 'getReferencedUsersOnDelete',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' }
      ],
      javaType: 'Set<Long>',
      javaCode: `
        return new HashSet<Long>();
      `
    }
  ]
});

