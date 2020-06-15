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
    'foam.nanos.crunch.UserCapabilityJunction',
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
    }
  ],  

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        Business business = (Business) ucj.findSourceId(x);
      
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
                    .setCauseId(response.getId())
                    .setClassification("Validate Business Onboarding UserCapabilityJunction Using SecureFact")
                    .setCauseDaoKey("securefactLEVDAO")
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
              .setCauseId(response != null ? response.getId() : 0L)
              .setClassification("Validate Business Onboarding UserCapabilityJunction Using SecureFact")
              .setCauseDaoKey("securefactLEVDAO")
              .build()
          );
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
