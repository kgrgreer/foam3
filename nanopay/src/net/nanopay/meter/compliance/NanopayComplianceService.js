foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'NanopayComplianceService',
  
  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.compliance.ComplianceService'
  ],

  imports: [
    'complianceRuleDAO?',
    'complianceHistoryDAO?'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.mlang.MLang',
    'java.time.Duration',
    'java.time.Instant',
    'java.util.Date',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      value: true,
      javaFactory: 'return true;'
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'entity',
          type: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( ! getEnabled() ) return;

        ((DAO) getComplianceRuleDAO()).where(
          MLang.EQ(ComplianceRule.ENABLED, true)
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            ComplianceRule rule = (ComplianceRule) obj;

            if ( rule.isApplicable(entity) ) {
              ComplianceHistory record = new ComplianceHistory.Builder(x)
                .setRuleId(rule.getId())
                .setEntity(entity)
                .setStatus(ComplianceValidationStatus.PENDING)
                .build();
              ((DAO) getComplianceHistoryDAO()).put(record);
            }
          }
        });
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'record',
          javaType: 'net.nanopay.meter.compliance.ComplianceHistory'
        }
      ],
      javaCode: `
        ComplianceRule rule = record.findRuleId(x);
        if ( rule != null ) {
          Duration validity = Duration.ofDays(rule.getValidity());
          Date expirationDate = Date.from(Instant.now().plus(validity));

          record.setStatus(rule.test(record.getEntity()));
          record.setExpirationDate(expirationDate);
        }
      `
    },
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
          if (user instanceof Business && agent != null) {
            return agent.getCompliance().equals(ComplianceStatus.PASSED);
          }
          return user.getCompliance().equals(ComplianceStatus.PASSED);
        }
        return false;
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
        if ( user != null ) {
          if ( user instanceof Business && user != null ) {
            return user.getCompliance().equals(ComplianceStatus.PASSED);
          }
          return true;
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
