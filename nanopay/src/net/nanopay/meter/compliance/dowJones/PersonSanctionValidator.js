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
  name: 'PersonSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
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
          Date filterLRDFrom = fetchLastExecutionDate(x, user.getId(), "Dow Jones User");
          if ( user.getAddress() != null && user.getAddress().getCountryId() != null ) {
            if ( user.getAddress().getCountryId().equals("CA") ) {
              filterRegion = "Canada,CANA,CA,CAN";
            } else if ( user.getAddress().getCountryId().equals("US") ) {
              filterRegion = "United States,USA,US";
            }
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
          ((Logger) x.get("logger")).info("PersonSanctionValidator ran for user id: " + searchData.getSearchId() + ", user name: " + searchData.getFirstName() + " " + searchData.getSurName());

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                String group = user.getSpid() + "-fraud-ops";
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(user.getId())
                    .setServerDaoKey("localUserDAO")
                    .setDaoKey("userDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("User Dow Jones R&C")
                    .setMatches(response.getResponseBody().getMatches())
                    .setGroup(group)
                    .setCreatedFor(user.getId())
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
