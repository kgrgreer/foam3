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
  name: 'CheckSelfRefPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Predicate used for checking self referencing approval requests.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.dao.Operation',
    'foam.util.SafetyUtil',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'classification'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        // Check if we are processing an approval request
        ApprovalRequest approvalRequest = (ApprovalRequest) NEW_OBJ.f(obj);
        if ( approvalRequest == null || approvalRequest.getStatus() == ApprovalStatus.REQUESTED || approvalRequest.getIsFulfilled() )
          return false;

        // Check if the approval request is for the ruler
        String classification = approvalRequest.getClassification();
        if ( SafetyUtil.isEmpty(classification) || ! SafetyUtil.equals(getClassification(), classification) )
          return false;
        
        // Only run on ApprovalRequests for the given classification
        return true;
      `
    }
  ]
});
