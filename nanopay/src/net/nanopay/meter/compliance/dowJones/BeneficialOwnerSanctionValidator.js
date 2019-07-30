foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BeneficialOwnerSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a beneficial owner using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesApprovalRequest',
    'net.nanopay.meter.compliance.dowJones.PersonNameSearchData',
    'net.nanopay.model.BeneficialOwner',
    'java.util.Date',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BeneficialOwner beneficialOwner = (BeneficialOwner) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          Date filterLRDFrom = fetchLastExecutionDate(x, beneficialOwner.getId(), "Dow Jones Person");
          PersonNameSearchData searchData = new PersonNameSearchData.Builder(x)
            .setSearchId(beneficialOwner.getId())
            .setFirstName(beneficialOwner.getFirstName())
            .setSurName(beneficialOwner.getLastName())
            .setFilterLRDFrom(filterLRDFrom)
            .setDateOfBirth(beneficialOwner.getBirthday())
            .setFilterRegion(beneficialOwner.getAddress().getCountryId())
            .build();

          DowJonesResponse response = dowJonesService.beneficialOwnerNameSearch(x, searchData);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(Long.toString(beneficialOwner.getId()))
                    .setDaoKey("beneficialOwnerDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("Validate Beneficial Owner Using Dow Jones")
                    .setMatches(response.getResponseBody().getMatches())
                    .build());
              }
            }, "Beneficial Owner Sanction Validator");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("BeneficialOwnerSanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
