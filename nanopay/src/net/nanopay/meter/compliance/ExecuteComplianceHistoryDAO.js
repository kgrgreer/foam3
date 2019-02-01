foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ExecuteComplianceHistoryDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `DAO decorator that asynchronously executes compliance rule
    against associated entity object on compliance history record.`,

  imports: [
    'threadPool?',
    'complianceService?'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.pool.FixedThreadPool'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( this.find_(x, obj) == null ) {
          ((FixedThreadPool) getThreadPool()).submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              ((ComplianceService) getComplianceService()).execute(
                getX(), (ComplianceHistory) obj.fclone());
            }
          });
        }

        return super.put_(x, obj);
      `
    },
  ]
});
