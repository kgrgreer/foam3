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
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsRejectedComplianceApprovalRequest',

  documentation: 'Returns true if new object is a ComplianceApprovalRequest with status=REJECTED.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(ComplianceApprovalRequest.class)), true),
          EQ(DOT(NEW_OBJ, ApprovalRequest.STATUS), ApprovalStatus.REJECTED)
        ).f(obj);
      `
    }
  ]
});
