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
  package: 'net.nanopay.crunch.compliance',
  name: 'AbstractManualValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: `Validates a user or business using an external API.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunctionDAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty'
    },
    {
      name: 'classification',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        User user = (User) ucj.findSourceId(x);

        try {
          FObject response = generateResponse(x, ucj);
          setResponse(response);
          
          if ( ! checkResponsePassedCompliance(x, response) ) {
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                ucj.setStatus(CapabilityJunctionStatus.PENDING_REVIEW);
                ((DAO) x.get("userCapabilityJunctionDAO")).put(ucj);

                if ( user.getCompliance() == ComplianceStatus.NOTREQUESTED ) {
                  User complianceUser = (User) user.fclone();
                  complianceUser.setCompliance(ComplianceStatus.REQUESTED);
                  ((DAO) x.get("localUserDAO")).put(complianceUser);
                }

                String group = user.getSpid().equals("nanopay") ? "fraud-ops" : user.getSpid() + "-fraud-ops";
                requestApproval(x, createComplianceApprovalRequest(x, ucj, group));
              }
            }, "Manual Validator Requires Approval: " + getClassification());

            ruler.putResult(ComplianceValidationStatus.INVESTIGATING);
          } else {
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                ucj.setStatus(CapabilityJunctionStatus.APPROVED);
                ((DAO) x.get("userCapabilityJunctionDAO")).put(ucj);
              }
            }, "Manual Validator Passed: " + getClassification());

            ruler.putResult(ComplianceValidationStatus.VALIDATED);
          }
          
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("Validator failed.", getClassification(), e);
          
          ucj.setStatus(CapabilityJunctionStatus.PENDING_REVIEW);
          ((DAO) x.get("userCapabilityJunctionDAO")).put(ucj);

          String group = SafetyUtil.isEmpty(user.getSpid()) || user.getSpid().equals("nanopay") ? "fraud-ops" : user.getSpid() + "-fraud-ops";
          requestApproval(x, createComplianceApprovalRequest(x, ucj, group));

          ruler.putResult(ComplianceValidationStatus.PENDING);

          // Alarm on failure
          ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
            .setName(getClassification() + " failed")
            .setReason(AlarmReason.UNSPECIFIED)
            .setNote(e.getMessage())
            .build());
        }
      `
    },
    {
      name: 'generateResponse',
      type: 'FObject',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'ucj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        }
      ],
      javaCode: `
        throw new RuntimeException("Not implemented");
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'response',
          type: 'FObject'
        }
      ],
      javaCode: `
        throw new RuntimeException("Not implemented");
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      type: 'net.nanopay.meter.compliance.ComplianceApprovalRequest',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'ucj',
          type: 'foam.nanos.crunch.UserCapabilityJunction'
        },
        {
          name: 'group',
          type: 'String'
        }
      ],
      javaCode: `
        throw new RuntimeException("Not implemented");
      `
    }
  ]
});
