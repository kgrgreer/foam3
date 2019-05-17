foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'PersonSanctionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'java.util.Date',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        Date filterLRDFrom = null;
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        try {
          ArraySink sink = (ArraySink) dowJonesResponseDAO.where(
            AND(
              EQ(DowJonesResponse.USER_ID, user.getId()),
              EQ(DowJonesResponse.SEARCH_TYPE, "Dow Jones Person"),
              LT(DowJonesResponse.SEARCH_DATE, new Date()),
              GT(DowJonesResponse.TOTAL_MATCHES, 0)
            )
          ).orderBy(DESC(DowJonesResponse.SEARCH_DATE)).limit(1).select(new ArraySink());

          if ( sink.getArray().size() > 0 ) {
            DowJonesResponse dowJonesResponse = (DowJonesResponse) sink.getArray().get(0);
            filterLRDFrom = dowJonesResponse.getSearchDate();
          }

          DowJonesResponse response = dowJonesService.personNameSearch(x, user.getFirstName(), user.getLastName(), filterLRDFrom, user.getBirthday(), user.getAddress().getCountryId());
          ComplianceValidationStatus status = ComplianceValidationStatus.VALIDATED;
          if ( response.getTotalMatches() > 0 ) {
            status = ComplianceValidationStatus.INVESTIGATING;
            requestApproval(x, 
              new ComplianceApprovalRequest.Builder(x)
                .setObjId(Long.toString(user.getId()))
                .setDaoKey("localUserDAO")
                .setCauseId(response.getId())
                .setCauseDaoKey("dowJonesResponseDAO")
                .build());
          }
          ruler.putResult(status);
        } catch (IllegalStateException e) {
          ((Logger) x.get("logger")).warning("PersonSanctionValidator failed.", e);
          ruler.putResult(ComplianceValidationStatus.PENDING);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";
      `
    }
  ]
});
