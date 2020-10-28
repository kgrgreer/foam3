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
    'java.util.concurrent.atomic.AtomicLong'
  ],

  properties: [
    {
      name: 'name',
      class: 'String',
      javaFactory: 'return this.getClass().getSimpleName();'
    },
    {
      name: 'minUserId',
      class: 'Long',
      value: 10001
    },
    {
      name: 'maxUserId',
      class: 'Long',
      value: 10100
    },
    {
      name: 'host',
      class: 'String',
      value: 'localhost'
    },
    {
      name: 'port',
      class: 'Long',
      value: 80
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

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  protected AtomicLong pass_ = new AtomicLong();
  protected AtomicLong fail_ = new AtomicLong();
        `);
      }
    }
  ],

  methods: [
    {
      name: 'getTransactionClient',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sessionId',
          type: 'String'
        }
      ],
      javaType: 'foam.dao.DAO',
      javaCode: `
      return new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sessionId)
          .setDelegate(new HTTPBox.Builder(x)
            .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(sessionId)
            .setUrl("http://"+getHost()+":"+getPort()+"/service/transactionDAO")
            .build())
          .build())
        .build();
      `
    },
    {
      name: 'getPlannerClient',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sessionId',
          type: 'String'
        }
      ],
      javaType: 'foam.dao.DAO',
      javaCode: `
      return new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sessionId)
          .setDelegate(new HTTPBox.Builder(x)
            .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(sessionId)
            .setUrl("http://"+getHost()+":"+getPort()+"/service/transactionPlannerDAO")
            .build())
          .build())
        .build();
      `
    },
    {
      name: 'setup',
      javaCode: `
      getLogger().info("setup");
      pass_ = new AtomicLong();
      fail_ = new AtomicLong();
      if ( getMaxUserId() - getMinUserId() < 2 ) {
        throw new RuntimeException("Invalid User Range");
      }
      `
    },
    {
      name: 'teardown',
      javaCode: `
      getLogger().info("teardown");
      stats.put("total", pass_.get() + fail_.get());
      stats.put("pass", pass_.get());
      stats.put("fail", fail_.get());
      `
    },
    {
      name: 'execute',
      javaCode: `
      long range = getMaxUserId() - getMinUserId() + 1;
      long amount = (long) (Math.random() * 100);
      long payerId = 0L;
      long payeeId = 0L;
      while ( payerId == payeeId ) {
        payerId = (long) (Math.floor(Math.random() * range) + getMinUserId());
        payeeId = (long) (Math.floor(Math.random() * range) + getMinUserId());
      }

      Transaction transaction = new Transaction();
      transaction.setPayerId(payerId);
      transaction.setPayeeId(payeeId);
      transaction.setAmount(amount);

      PM pm = PM.create(x, getName(), "execute");
      try {
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction(transaction);
        getLogger().debug("quote", "request");
        PM quotePm = PM.create(x, getName(), "quote");
        quote = (TransactionQuote) getPlannerClient(x, String.valueOf(payerId)).put(quote);
        if ( quote == null ) {
          quotePm.error(x, "null quote");
          throw new Exception("null quote returned on request. payerId: "+payerId+", payerId: "+payeeId+", amount: "+amount);
        }
        transaction = quote.getPlan();
        quotePm.log(x);
        getLogger().debug("quote", "response", transaction.getId());
        getLogger().debug("transaction", "request");
        PM txnPm = PM.create(x, getName(), "transaction");
        transaction = (Transaction) getTransactionClient(x, String.valueOf(payerId)).put(transaction);
        if ( transaction == null ) {
          txnPm.error(x, "null transaction");
          throw new Exception("null transaction returned on request. payerId: "+payerId+", payerId: "+payeeId+", amount: "+amount);
        }
        txnPm.log(x);
        getLogger().debug("transaction", "response", transaction.getId());
        pass_.incrementAndGet();
      } catch (Throwable e) {
        fail_.incrementAndGet();
        getLogger().warning(e.getMessage(), e);
        pm.error(x, e);
      } finally {
        pm.log(x);
      }
      `
    },
  ]
});
