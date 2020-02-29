foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesApprovalRequest',
    'net.nanopay.meter.compliance.dowJones.PersonNameSearchData',
    'java.util.Date',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          String filterRegion = "";
          Date filterLRDFrom = fetchLastExecutionDate(x, user.getId(), "Dow Jones Person");
          if ( user.getAddress().getCountryId().equals("CA") ) {
            filterRegion = "Canada,CANA,CA,CAN";
          } else if ( user.getAddress().getCountryId().equals("US") ) {
            filterRegion = "United States,USA,US";
          }
          PersonNameSearchData searchData = new PersonNameSearchData.Builder(x)
            .setSearchId(user.getId())
            .setFirstName(user.getFirstName())
            .setSurName(user.getLastName())
            .setFilterLRDFrom(filterLRDFrom)
            .setDateOfBirth(user.getBirthday())
            .setFilterRegion(filterRegion)
            .build();

          DowJonesResponse response = dowJonesService.personNameSearch(x, searchData);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x, 
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(Long.toString(user.getId()))
                    .setDaoKey("localUserDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("Validate User Using Dow Jones")
                    .setMatches(response.getResponseBody().getMatches())
                    .build());
              }
            }, "Person Sanction Validator");
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("PersonSanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
