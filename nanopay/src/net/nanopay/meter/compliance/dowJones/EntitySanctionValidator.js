foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'EntitySanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.DowJonesApprovalRequest',
    'net.nanopay.meter.compliance.dowJones.EntityNameSearchData',
    'net.nanopay.meter.compliance.dowJones.PersonNameSearchData',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessDirector',
    'java.util.Calendar',
    'java.util.Date',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Business business = (Business) obj;
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          String filterRegion = "";
          Date filterLRDFrom = fetchLastExecutionDate(x, business.getId(), "Dow Jones Entity");
          if ( business.getAddress().getCountryId().equals("CA") ) {
            filterRegion = "Canada,CANA,CA,CAN";
          } else if ( business.getAddress().getCountryId().equals("US") ) {
            filterRegion = "United States,USA,US";
          }
          EntityNameSearchData searchData = new EntityNameSearchData.Builder(x)
            .setSearchId(business.getId())
            .setEntityName(business.getOrganization())
            .setFilterLRDFrom(filterLRDFrom)
            .setFilterRegion(filterRegion)
            .build();

          DowJonesResponse response = dowJonesService.entityNameSearch(x, searchData);
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(Long.toString(business.getId()))
                    .setDaoKey("localUserDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("Validate Entity Using Dow Jones")
                    .setMatches(response.getResponseBody().getMatches())
                    .build());
              }
            }, "Entity Sanction Validator");
          }

          if ( business.getBusinessDirectors().length > 0 ) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(filterLRDFrom);
            calendar.add(Calendar.DATE, -1);
            Date dayBefore = calendar.getTime();

            for ( int i = 0; i < business.getBusinessDirectors().length; i++ ) {
              BusinessDirector businessDirector = (BusinessDirector) business.getBusinessDirectors()[i];
              String firstName = businessDirector.getFirstName();
              String lastName = businessDirector.getLastName();

              PersonNameSearchData directorSearchData = new PersonNameSearchData.Builder(x)
                .setFirstName(firstName)
                .setSurName(lastName)
                .setFilterLRDFrom(dayBefore)
                .build();

              DowJonesResponse directorResponse = dowJonesService.personNameSearch(x, directorSearchData);
              if ( directorResponse.getTotalMatches() > 0 ) {
                agency.submit(x, new ContextAgent() {
                  @Override
                  public void execute(X x) {
                    requestApproval(x,
                      new DowJonesApprovalRequest.Builder(x)
                        .setObjId(Long.toString(business.getId()))
                        .setDaoKey("localUserDAO")
                        .setCauseId(directorResponse.getId())
                        .setCauseDaoKey("dowJonesResponseDAO")
                        .setClassification("Validate Business Director Using Dow Jones")
                        .setMatches(directorResponse.getResponseBody().getMatches())
                        .build());
                  }
                }, "Business Director Sanction Validator");
              }
            }
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("EntitySanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
