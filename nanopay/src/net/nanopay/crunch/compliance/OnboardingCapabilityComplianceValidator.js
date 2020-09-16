foam.CLASS({
  package: 'net.nanopay.crunch.compliance',
  name: 'OnboardingCapabilityComplianceValidator',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Triggers a compliance check for onboarding capability.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
    'java.util.Date',
    'net.nanopay.meter.compliance.dowJones.DowJonesService',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.dowJones.PersonNameSearchData',
    'net.nanopay.meter.compliance.secureFact.SecurefactService',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
        DAO userDAO = (DAO) x.get("localUserDAO");
        User user = (User) userDAO.find(ucj.getSourceId());
        DowJonesService dowJonesService = (DowJonesService) x.get("dowJonesService");
        SecurefactService securefactService = (SecurefactService) x.get("securefactService");

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
          
          PersonNameSearchData personSearchData = new PersonNameSearchData.Builder(x)
            .setSearchId(user.getId())
            .setFirstName(user.getFirstName())
            .setSurName(user.getLastName())
            .setFilterLRDFrom(filterLRDFrom)
            .setDateOfBirth(user.getBirthday())
            .setFilterRegion(filterRegion)
            .build();

          DowJonesResponse djResponse = dowJonesService.personNameSearch(x, personSearchData);
          SIDniResponse sidniResponse = securefactService.sidniVerify(x, user);
        } catch (Exception e) {
          ((Logger) x.get("logger")).warning("OnboardingCapabilityComplianceValidator failed.", e);
        }

      `
    }
  ]
});
