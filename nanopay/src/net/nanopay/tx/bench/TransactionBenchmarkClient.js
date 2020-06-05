foam.CLASS({
  package: 'net.nanopay.tx.bench',
  name: 'TransactionBenchmarkClient',

  implements: ['foam.nanos.bench.Benchmark'],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.boot.NSpec',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PMBox',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    {
      name: 'minAccountId',
      class: 'Long',
      value: 182
    },
    {
      name: 'maxAccountId',
      class: 'Long',
      value: 282
    },
    {
      name: 'sessionId',
      class: 'String',
      value: 'e6a6f1d4-94dd-82db-ecd8-f3f4ea9ef738'
    },
    {
      name: 'url',
      class: 'String',
      value: 'http://localhost:8080/service/transactionDAO'
    },
    {
      name: 'client',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'transactions',
      class: 'Long'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    },
  ],

  methods: [
    {
      name: 'setup',
      javaCode: `
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;
    getLogger().info("setup");
    StringBuilder sb = new StringBuilder();
    sb.append(System.getProperty("hostname", "localhost"));
    sb.append(":");
    sb.append(getUrl());
    String id = sb.toString();

    setClient(
      new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(getSessionId())
          .setDelegate(new PMBox.Builder(x)
            .setClassType(ClientDAO.getOwnClassInfo())
            .setName(id)
            .setDelegate(new HTTPBox.Builder(x)
              .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
              .setSessionID(getSessionId())
              .setUrl(getUrl())
              .build())
            .build())
          .build())
        .build()
     );

     setTransactions(0L);
      `
    },
    {
      name: 'teardown',
      javaCode: `
    getLogger().info("teardown");
    stats.put("Transactions", getTransactions());
      `
    },
    {
      name: 'execute',
      javaCode: `
    AppConfig config = (AppConfig) x.get("appConfig");
    if ( config.getMode() == foam.nanos.app.Mode.PRODUCTION ) return;
    getLogger().info("execute");

    long range = getMaxAccountId() - getMinAccountId() + 1;
    long sourceId = (long) (Math.floor(Math.random() * range) + getMinAccountId());
    long destinationId = (long) (Math.floor(Math.random() * range) + getMinAccountId());
    long amount = (long) (Math.random() * 100);

    net.nanopay.tx.model.Transaction txn = new net.nanopay.tx.model.Transaction();
    txn.setSourceAccount(sourceId);
    txn.setDestinationAccount(destinationId);
    txn.setAmount(amount);

    try {
      synchronized (this) {
        setTransactions(getTransactions() +1);
      }
      txn = (Transaction) getClient().put(txn);
      getLogger().info(txn.getId(), txn.getStatus().getLabel());
    } catch ( Throwable t ) {
      getLogger().error(t);
    }
      `
    },
  ]
});
