foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'BeneficialOwnerSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a beneficial owner using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
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
        BeneficialOwner owner = null;

        for ( int i = 1 ; i <= data.getAmountOfOwners() ; i++ ) {
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          try {
            owner = (BeneficialOwner) data.getProperty("owner"+i);
            status = checkOwnerCompliance(x, owner);
          } catch (Exception e) {
            status = ComplianceValidationStatus.PENDING;
          }
          if ( status != ComplianceValidationStatus.VALIDATED ) {
            DowJonesResponse response = getResponse();
            rulerResult = ComplianceValidationStatus.PENDING;

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
                    .setClassification("Validate Beneficial Owner " + index + " Using Dow Jones")
                    .setMatches(response != null ? response.getResponseBody().getMatches() : null)
                    .setComments("Further investigation needed for owner: " + index)
                    .build());
              }
            }, "Beneficial Owner Sanction Validator");
          }
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
