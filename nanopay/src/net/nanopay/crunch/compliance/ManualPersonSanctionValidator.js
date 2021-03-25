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
  name: 'ManualPersonSanctionValidator',
  extends: 'net.nanopay.crunch.compliance.AbstractManualValidator',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.dowJones.*'
  ],

  methods: [
    {
      name: 'generateResponse',
      javaCode: `
        User user = (User) ucj.findSourceId(x);
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        
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

        DowJonesResponse response = dowJonesService.personNameSearch(x, searchData);
        ((Logger) x.get("logger")).info("PersonSanctionValidator ran for user id: " + searchData.getSearchId() + ", user name: " + searchData.getFirstName() + " " + searchData.getSurName());

        return response;
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      javaCode: `
        DowJonesResponse dowJonesResponse = (DowJonesResponse) response;
        return (dowJonesResponse.getTotalMatches() > 0);
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      javaCode: `
        DowJonesResponse dowJonesResponse = (DowJonesResponse) getResponse();
        User user = (User) ucj.findSourceId(x);

        return new DowJonesApprovalRequest.Builder(x)
          .setObjId(ucj.getId())
          .setDaoKey("userCapabilityJunctionDAO")
          .setRefObjId(user.getId())
          .setRefDaoKey("userDAO")
          .setCauseId(dowJonesResponse != null ? dowJonesResponse.getId() : 0L)
          .setCauseDaoKey("dowJonesResponseDAO")
          .setClassification(getClassification())
          .setMatches(dowJonesResponse != null ? dowJonesResponse.getResponseBody().getMatches() : null)
          .setGroup(group)
          .setCreatedFor(user.getId())
          .build();
      `
    }
  ]
});
