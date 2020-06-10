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
  name: 'PersonSanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunctionDAO',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.*',
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
        UserCapabilityJunctionDAO ucjDAO = new UserCapabilityJunctionDAO.Builder(x).build();

        Capability capability = (Capability) ucj.findTargetId(x);
        User user = (User) ucjDAO.saveDataToDAO(x, capability, ucj, false);

        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          String filterRegion = "";
          Date filterLRDFrom = fetchLastExecutionDate(x, user.getId(), "Dow Jones User");
          if ( user.getAddress().getCountryId() != null ) {
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

          setResponse(dowJonesService.personNameSearch(x, searchData));
          ((Logger) x.get("logger")).info("PersonSanctionValidator ran for user id: " + searchData.getSearchId() + ", user name: " + searchData.getFirstName() + " " + searchData.getSurName());

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;

          DowJonesResponse response = getResponse();

          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x, 
                  new DowJonesApprovalRequest.Builder(x)
                    .setEntityId(user.getId())
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassification("Validate Signing Officer UserCapabilityJunction Using Dow Jones")
                    .setMatches(response.getResponseBody().getMatches())
                    .build());
              }
            }, "Person Sanction Validator");
          }
          ruler.putResult(status);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("PersonSanctionValidator failed.", e);
          DowJonesResponse response = getResponse();
          requestApproval(x, 
            new DowJonesApprovalRequest.Builder(x)
              .setEntityId(user.getId())
              .setObjId(ucj.getId())
              .setDaoKey("userCapabilityJunctionDAO")
              .setCauseId(response != null ? response.getId() : 0L)
              .setCauseDaoKey("dowJonesResponseDAO")
              .setClassification("Validate Signing Officer UserCapabilityJunction Using Dow Jones")
              .setMatches(response != null ? response.getResponseBody().getMatches() : null)
              .build());
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
