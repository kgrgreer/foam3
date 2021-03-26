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
  name: 'BeneficialOwnerSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a beneficial owner using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'net.nanopay.crunch.onboardingModels.BusinessOwnershipData',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.*',
    'net.nanopay.model.BeneficialOwner',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        BusinessOwnershipData data = (BusinessOwnershipData) ucj.getData();

        ComplianceValidationStatus rulerResult = ComplianceValidationStatus.VALIDATED;
        User user = (User) ucj.findSourceId(x);
        String group = user.getSpid() + "-fraud-ops";

        boolean autoValidated = true;
        int i = 0;
        for ( BeneficialOwner owner : data.getOwners() ) {
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          try {
            status = checkOwnerCompliance(x, owner);
          } catch (Exception e) {
            status = ComplianceValidationStatus.PENDING;
          }
          if ( status != ComplianceValidationStatus.VALIDATED ) {
            DowJonesResponse response = getResponse();
            rulerResult = ComplianceValidationStatus.PENDING;
            autoValidated = false;

            int index = i;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setCauseId(response != null ? response.getId() : 0L)
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("Beneficial Owner " + index + " Dow Jones R&C")
                    .setMatches(response != null ? response.getResponseBody().getMatches() : null)
                    .setComments("Further investigation needed for owner: " + index)
                    .setGroup(group)
                    .setCreatedFor(user.getId())
                    .build());
              }
            }, "Beneficial Owner Sanction Validator");
          }
          i++;
        }
        if ( autoValidated ) {
          X userX = ruler.getX().put("subject", ucj.getSubject(x));
          ((CrunchService) userX.get("crunchService")).updateJunction(
            userX,
            ucj.getTargetId(),
            null,
            CapabilityJunctionStatus.APPROVED);
        }
        ruler.putResult(rulerResult);
      `
    },
    {
      name: 'checkOwnerCompliance',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'beneficialOwner', javaType: 'net.nanopay.model.BeneficialOwner' }
      ],
      javaType: 'net.nanopay.meter.compliance.ComplianceValidationStatus',
      javaCode: `
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");

        try {
          Date filterLRDFrom = fetchLastExecutionDate(x, beneficialOwner.getId(), "Dow Jones Beneficial Owner");
          String filterRegion = "";

          if ( beneficialOwner.getAddress().getCountryId().equals("CA") ) {
            filterRegion = "Canada,CANA,CA,CAN";
          } else if ( beneficialOwner.getAddress().getCountryId().equals("US") ) {
            filterRegion = "United States,USA,US";
          }

          PersonNameSearchData searchData = new PersonNameSearchData.Builder(x)
            .setSearchId(beneficialOwner.getId())
            .setFirstName(beneficialOwner.getFirstName())
            .setSurName(beneficialOwner.getLastName())
            .setFilterLRDFrom(filterLRDFrom)
            .setDateOfBirth(beneficialOwner.getBirthday())
            .setFilterRegion(filterRegion)
            .build();

          setResponse(dowJonesService.beneficialOwnerNameSearch(x, searchData));

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          DowJonesResponse response = getResponse();

          if ( response.getTotalMatches() > 0 ) status = ComplianceValidationStatus.INVESTIGATING;

          return status;
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("BeneficialOwnerSanctionValidator failed.", e);
          return ComplianceValidationStatus.PENDING;
        }
      `
    }
  ]
});
