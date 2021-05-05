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
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'EntitySanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
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
          if ( business.getAddress().getCountryId() != null ) {
            if ( business.getAddress().getCountryId().equals("CA") ) {
              filterRegion = "Canada,CANA,CA,CAN";
            } else if ( business.getAddress().getCountryId().equals("US") ) {
              filterRegion = "United States,USA,US";
            }
          }

          EntityNameSearchData searchData = new EntityNameSearchData.Builder(x)
            .setSearchId(business.getId())
            .setEntityName(business.getOrganization())
            .setFilterLRDFrom(filterLRDFrom)
            .setFilterRegion(filterRegion)
            .build();

          DowJonesResponse response = dowJonesService.entityNameSearch(x, searchData);
          ((Logger) x.get("logger")).info("EntitySanctionValidator ran for entity id: " + searchData.getSearchId() + ", entity name: " + searchData.getEntityName());

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(business.getId())
                    .setDaoKey("userDAO")
                    .setServerDaoKey("localUserDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassificationEnum(ApprovalRequestClassificationEnum.BUSINESS_DOW_JONES)
                    .setMatches(response.getResponseBody().getMatches())
                    .setCreatedFor(business.getId())
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
                        .setObjId(business.getId())
                        .setServerDaoKey("localUserDAO")
                        .setDaoKey("userDAO")
                        .setCauseId(directorResponse.getId())
                        .setCauseDaoKey("dowJonesResponseDAO")
                        .setReferenceSummary(businessDirector.toSummary())
                        .setClassificationEnum(ApprovalRequestClassificationEnum.BUSINESS_DIRECTOR_DOW_JONES)
                        .setMatches(directorResponse.getResponseBody().getMatches())
                        .setCreatedFor(business.getId())
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
