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
  package: 'net.nanopay.tx.bench',
  name: 'TransactionBenchmarkClient',

  implements: ['foam.nanos.bench.Benchmark'],

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPBox',
    'foam.box.SessionClientBox',
    'foam.core.FObject',
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
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
  ],

  properties: [
    {
      name: 'name',
      class: 'String',
      javaFactory: 'return this.getClass().getSimpleName();'
    },
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
          .setDelegate(new HTTPBox.Builder(x)
            .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(getSessionId())
            .setUrl(getUrl())
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
//    getLogger().info("execute");
    PM pm = PM.create(x, this.getOwnClassInfo(), getName());

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
//      getLogger().info("execute", "put", "request", "transaction");
      txn = (Transaction) getClient().put(txn);
//      getLogger().info("execute", "put", "response", "transaction", txn.getId(), txn.getStatus().getLabel());
    } catch ( Throwable t ) {
      getLogger().error(t.getMessage(), t);
    } finally {
      pm.log(x);
    }
      `
    },
  ]
});
