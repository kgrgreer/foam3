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
  name: 'SecurefactLEVValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Validates a business using SecureFact LEV api.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVResponse'
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
        Business business = (Business) ucj.findSourceId(x);

        User user = (User) ucj.findSourceId(x);
        String group = user.getSpid() + "-fraud-ops";

        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        try {
          setResponse(securefactService.levSearch(x, business));
          LEVResponse response = getResponse();
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( ! response.hasCloseMatches() ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new ComplianceApprovalRequest.Builder(x)
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setRefObjId(business.getId())
                    .setRefDaoKey("businessDAO")
                    .setCauseId(response.getId())
                    .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(getClassification()))
                    .setCauseDaoKey("securefactLEVDAO")
                    .setCreatedFor(business.getId())
                    .setGroup(group)
                    .build()
                );
              }
            }, "Securefact LEV Validator");
          }
          ruler.putResult(status);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("LEVValidator failed.", e);
          LEVResponse response = getResponse();
          requestApproval(x,
            new ComplianceApprovalRequest.Builder(x)
              .setObjId(ucj.getId())
              .setDaoKey("userCapabilityJunctionDAO")
              .setRefObjId(business.getId())
              .setRefDaoKey("businessDAO")
              .setCauseId(response != null ? response.getId() : 0L)
              .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(getClassification()))
              .setCauseDaoKey("securefactLEVDAO")
              .setCreatedFor(business.getId())
              .setGroup(group)
              .build()
          );
          ruler.putResult(ComplianceValidationStatus.PENDING);
          ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
            .setName("LEVValidator failed")
            .setReason(AlarmReason.CREDENTIALS)
            .setNote(e.getMessage())
            .build());
        }
      `
    }
  ]
});
