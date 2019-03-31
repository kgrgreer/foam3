foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'NanopayComplianceService',

  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    }
  ],

  methods: [
    {
      name: 'checkUserCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        User user = (User) x.get("user");
        if ( user != null && user.getId() != 1 ) {
          User agent = (User) x.get("agent");
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          if ( agent == null ) {
            Session session = x.get(Session.class);
            agent = (User) session.getContext().get("agent");
            if ( agent != null ) {
              logger.debug(this.getClass().getSimpleName(), "'agent'", agent.getId(), "found in SESSION context for user", user.getId());
            } else {
              logger.warning(this.getClass().getSimpleName(), "'agent' NOT found in context, falling back to compliance check on 'user'", user.getId(), "rather than 'agent'. ");
            }
          } else {
            logger.debug(this.getClass().getSimpleName(), "'agent'", agent.getId(), "found in context for user", user.getId());
          }
          if ( agent != null &&
               user instanceof Business ) {
            return ComplianceStatus.PASSED == agent.getCompliance();
          }
          return ComplianceStatus.PASSED == user.getCompliance();
        }
        return true;
      `
    },
    {
      name: 'checkBusinessCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        User user = (User) x.get("user");
        if ( user instanceof Business ) {
          return ComplianceStatus.PASSED == user.getCompliance();
        }
        return true;
      `
    },
    {
      name: 'checkAccountCompliance',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        // return true for now until we design a way to retrieve the active account
        return true;
      `
    }
  ]
});
