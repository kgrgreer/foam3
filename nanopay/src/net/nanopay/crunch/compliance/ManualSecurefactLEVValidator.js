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
  name: 'ManualSecurefactLEVValidator',
  extends: 'net.nanopay.crunch.compliance.AbstractManualValidator',

  documentation: `Validates a business using SecureFact LEV api.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'generateResponse',
      javaCode: `
        Business business = (Business) ucj.findSourceId(x);
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");
        return securefactService.levSearch(x, business);
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      javaCode: `
        LEVResponse levResponse = (LEVResponse) response;
        return levResponse.hasCloseMatches();
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      javaCode: `
        LEVResponse levResponse = (LEVResponse) getResponse();
        Business business = (Business) ucj.findSourceId(x);

        return new ComplianceApprovalRequest.Builder(x)
          .setObjId(ucj.getId())
          .setDaoKey("userCapabilityJunctionDAO")
          .setRefObjId(business.getId())
          .setRefDaoKey("businessDAO")
          .setCauseId(levResponse != null ? levResponse.getId() : 0L)
          .setClassification(getClassification())
          .setCauseDaoKey("securefactLEVDAO")
          .setCreatedFor(business.getId())
          .setGroup(group)
          .build();
      `
    }
  ]
});
