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
  name: 'EntitySanctionValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates an entity using Dow Jones Risk and Compliance API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Calendar',
    'java.util.Date',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.meter.compliance.dowJones.*',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'response',
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse'
    },
    {
      name: 'classification',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        Business business = (Business) ucj.findSourceId(x);

        User user = (User) ucj.findSourceId(x);
        String group = user.getSpid() + "-fraud-ops";

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

          setResponse(dowJonesService.entityNameSearch(x, searchData));
          DowJonesResponse response = getResponse();
          ((Logger) x.get("logger")).info("EntitySanctionValidator ran for entity id: " + searchData.getSearchId() + ", entity name: " + searchData.getEntityName());

          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                requestApproval(x,
                  new DowJonesApprovalRequest.Builder(x)
                    .setObjId(ucj.getId())
                    .setDaoKey("userCapabilityJunctionDAO")
                    .setRefObjId(business.getId())
                    .setRefDaoKey("businessDAO")
                    .setCauseId(response.getId())
                    .setCauseDaoKey("dowJonesResponseDAO")
                    .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(getClassification()))
                    .setMatches(response.getResponseBody().getMatches())
                    .setGroup(group)
                    .setCreatedFor(business.getId())
                    .build());
              }
            }, "Entity Sanction Validator");
          }
          ruler.putResult(status);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("EntitySanctionValidator failed.", e);
          DowJonesResponse response = getResponse();
          requestApproval(x,
            new DowJonesApprovalRequest.Builder(x)
              .setObjId(ucj.getId())
              .setDaoKey("userCapabilityJunctionDAO")
              .setRefObjId(business.getId())
              .setRefDaoKey("businessDAO")
              .setCauseId(response != null ? response.getId() : 0L)
              .setCauseDaoKey("dowJonesResponseDAO")
              .setClassificationEnum(ApprovalRequestClassificationEnum.forLabel(getClassification()))
              .setMatches(response != null ? response.getResponseBody().getMatches() : null)
              .setGroup(group)
              .setCreatedFor(business.getId())
              .build());
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    }
  ]
});
