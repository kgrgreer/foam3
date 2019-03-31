foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'NanopayComplianceService',

  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  javaImports: [
    'foam.nanos.auth.User',
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
        if ( user != null ) {
          User agent = (User) x.get("agent");
          if ( agent == null ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
            logger.warning(this.getClass().getSimpleName(), "'agent' not found in context, falling back to compliance check on 'user' rather than 'agent'. ");
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
