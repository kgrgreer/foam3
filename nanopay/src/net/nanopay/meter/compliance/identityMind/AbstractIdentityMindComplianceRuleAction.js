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
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'AbstractIdentityMindComplianceRuleAction',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.HashMap',
    'java.util.Map',
    'foam.nanos.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'identityMindUserId',
      class: 'Long',
      value: 1013
    }
  ],

  methods: [
    {
      name: 'getApprovalStatus',
      type: 'foam.nanos.approval.ApprovalStatus',
      args: [
        {
          name: 'status',
          type: 'net.nanopay.meter.compliance.ComplianceValidationStatus'
        }
      ],
      javaCode: `
        if ( ComplianceValidationStatus.VALIDATED == status ) {
          return ApprovalStatus.APPROVED;
        } else if ( ComplianceValidationStatus.REJECTED == status ) {
          return ApprovalStatus.REJECTED;
        }
        return ApprovalStatus.REQUESTED;
      `
    },
    {
      name: 'getApprover',
      type: 'Long',
      args: [
        {
          name: 'status',
          type: 'net.nanopay.meter.compliance.ComplianceValidationStatus'
        }
      ],
      javaCode: `
        if ( ComplianceValidationStatus.VALIDATED == status
          || ComplianceValidationStatus.REJECTED == status
        ) {
          return getIdentityMindUserId();
        }
        return 0L;
      `
    },
    {
      name: 'applyAction',
      javaCode: ` `
    }
  ]
});
