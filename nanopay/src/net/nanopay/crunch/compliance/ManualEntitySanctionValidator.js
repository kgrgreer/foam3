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
  name: 'ManualEntitySanctionValidator',
  extends: 'net.nanopay.crunch.compliance.AbstractManualValidator',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.*',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'generateResponse',
      javaCode: `
        Business business = (Business) ucj.findSourceId(x);
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");

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
        ((Logger) x.get("logger")).info("Entity sanction validation ran for entity id: " + searchData.getSearchId() + ", entity name: " + searchData.getEntityName());

        return response;
      `
    },
    {
      name: 'checkResponsePassedCompliance',
      javaCode: `
        DowJonesResponse dowJonesResponse = (DowJonesResponse) response;
        return ( dowJonesResponse.getTotalMatches() > 0 );
      `
    },
    {
      name: 'createComplianceApprovalRequest',
      javaCode: `
        DowJonesResponse dowJonesResponse = (DowJonesResponse) getResponse();
        Business business = (Business) ucj.findSourceId(x);

        return new DowJonesApprovalRequest.Builder(x)
          .setObjId(ucj.getId())
          .setDaoKey("userCapabilityJunctionDAO")
          .setRefObjId(business.getId())
          .setRefDaoKey("businessDAO")
          .setCauseId(dowJonesResponse != null ? dowJonesResponse.getId() : 0L)
          .setCauseDaoKey("dowJonesResponseDAO")
          .setClassificationEnum(ApprovalRequestClassificationEnum.MANUAL_BUSINESS_DOW_JONES)
          .setMatches(dowJonesResponse != null ? dowJonesResponse.getResponseBody().getMatches() : null)
          .setGroup(group)
          .setCreatedFor(business.getId())
          .build();
      `
    }
  ]
});
