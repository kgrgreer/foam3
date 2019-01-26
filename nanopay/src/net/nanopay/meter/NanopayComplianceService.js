foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'NanopayComplianceService',
  
  documentation: 'Implementation of Compliance Service used for validating user/business/account compliance',

  implements: [
    'net.nanopay.meter.ComplianceService'
  ],

  imports: [
    'complianceRuleDAO?',
    'complianceHistoryDAO?'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'java.time.Duration',
    'java.time.Instant',
    'java.util.Date',
    'net.nanopay.meter.ComplianceHistory',
    'net.nanopay.meter.ComplianceRule',
    'net.nanopay.meter.ComplianceValidationStatus',
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
          javaType: 'foam.core.X'
        },
        {
          name: 'entity',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: `
        if ( ! getEnabled() ) return;

        ((DAO) getComplianceRuleDAO()).where(
          MLang.EQ(ComplianceRule.ENABLED, true)
        ).select(new AbstractSink() { // TODO: extract class
          @Override
          public void put(Object obj, Detachable sub) {
            ComplianceRule rule = (ComplianceRule) obj;

            if ( rule.isApplicable(entity) ) {
              Duration validity = Duration.ofDays(rule.getValidity());
              Date expirationDate = Date.from(Instant.now().plus(validity));
              ComplianceHistory record = new ComplianceHistory.Builder(x)
                .setRuleId(rule.getId())
                .setEntity(entity)
                .setStatus(ComplianceValidationStatus.PENDING)
                .setExpirationDate(expirationDate)
                .build();

              ((DAO) getComplianceHistoryDAO()).put(record);
            }
          }
        });
      `
    }
  ]
});