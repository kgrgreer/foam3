foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ExecuteComplianceHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that asynchronously executes compliance rule
    against associated entity object on compliance history record.`,

  imports: [
    'threadPool?',
    'complianceHistoryDAO?',
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.pool.FixedThreadPool',
    'java.time.Duration',
    'java.time.Instant',
    'java.util.Date',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( this.find_(x, obj) == null ) {
          ((FixedThreadPool) getThreadPool()).submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              ComplianceHistory record = (ComplianceHistory) obj.fclone();
              ComplianceRule rule = record.findRuleId(x);

              if ( rule != null ) {
                boolean isPassed = rule.execute(record.getEntity());
                if ( isPassed ) {
                  Duration validity = Duration.ofDays(rule.getValidity());
                  Date expirationDate = Date.from(Instant.now().plus(validity));

                  record.setStatus(ComplianceValidationStatus.VALIDATED);
                  record.setExpirationDate(expirationDate);
                } else {
                  record.setStatus(ComplianceValidationStatus.INVESTIGATING);
                }
                ((DAO) getComplianceHistoryDAO()).inX(x).put(record);
              }
            }
          });
        }

        return super.put_(x, obj);
      `
    },
  ]
});
