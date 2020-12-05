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
    'foam.box.RemoteException',
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.ValidationException',
    'foam.dao.ArraySink',
    'foam.dao.ClientDAO',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.boot.NSpec',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.bench.Benchmark',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'java.util.Map',
    'java.util.HashMap'
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
      documentation: 'Record balance before tests, keep track locally, and compare with server at end of test. NOTE: this only works when running a single instance of test.',
      name: 'verifyBalance',
      class: 'Boolean',
      value: false
    },
    {
      name: 'balances',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'getClient',
      synchronized: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'sessionId',
          type: 'String'
        },
        {
          name: 'serviceName',
          type: 'String'
        }
      ],
      javaType: 'foam.dao.DAO',
      javaCode: `
      Map serviceClients = (Map) getClients().get(serviceName);
      if ( serviceClients == null ) {
        serviceClients = new HashMap();
        getClients().put(serviceName, serviceClients);
      }
      DAO client = (DAO) serviceClients.get(sessionId);
      if ( client == null ) {
        client = new ClientDAO.Builder(x)
        .setDelegate(new SessionClientBox.Builder(x)
          .setSessionID(sessionId)
          .setDelegate(new HTTPBox.Builder(x)
            .setAuthorizationType(foam.box.HTTPAuthorizationType.BEARER)
            .setSessionID(sessionId)
            .setUrl("http://"+getHost()+":"+getPort()+"/service/"+serviceName)
            .build())
          .build())
        .build();
        serviceClients.put(sessionId, client);
      }
      return client;
      `
    },
    {
      name: 'setup',
      javaCode: `
      if ( getMaxUserId() - getMinUserId() < 2 ) {
        throw new RuntimeException("Invalid User Range");
      }
      Map balances = new HashMap<Long, Long>();
      setBalances(balances);
      for ( long i = getMinUserId(); i <= getMaxUserId(); i++ ) {
        Balance balance = (Balance) getClient(x, String.valueOf(i), "balanceDAO").find(i);
        if ( balance != null ) {
          balances.put(i, balance.getBalance());
        }
      }
      `
    },
    {
      name: 'teardown',
      javaCode: `
      if ( ! getVerifyBalance() ) return;

      for ( long i = getMinUserId(); i <= getMaxUserId(); i++ ) {
        Balance remote = (Balance) getClient(x, String.valueOf(i), "balanceDAO").find(i);
        if ( remote != null ) {
          if ( remote.getBalance() != (Long) getBalances().get(i) ) {
            Logger logger = (Logger) x.get("logger");
            logger.error("Balance mismatch", "user", i, "expected", remote.getBalance(), "found", getBalances().get(i));
          }
        }
      }
      `
    },
    {
      name: 'execute',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      long range = getMaxUserId() - getMinUserId() + 1;
      long amount = (long) (Math.random() * 100);
      Long payerId = 0L;
      Long payeeId = 0L;
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
         logger.debug("quote", "request");
        PM quotePm = PM.create(x, getName(), "quote");
        quote = (TransactionQuote) getClient(x, String.valueOf(payerId), "transactionPlannerDAO").put(quote);
        if ( quote == null ) {
          quotePm.error(x, "null quote");
          throw new Exception("null quote returned on request. payerId: "+payerId+", payerId: "+payeeId+", amount: "+amount);
        }
        transaction = quote.getPlan();
        quotePm.log(x);
        logger.debug("quote", "response", payerId, transaction.getId());
        logger.debug("transaction", "request");
        PM txnPm = PM.create(x, getName(), "transaction");
        transaction = (Transaction) getClient(x, String.valueOf(payerId), "transactionDAO").put(transaction);
        if ( transaction == null ) {
          txnPm.error(x, "null transaction");
          throw new Throwable("null transaction returned on request. payerId: "+payerId+", payerId: "+payeeId+", amount: "+amount);
        } else {
          txnPm.log(x);
          logger.debug("transaction", "response", transaction.getId());
          synchronized ( this ) {
            long from = (Long) getBalances().get(payerId);
            from -= amount;
            getBalances().put(payerId, from);

            long to = (Long) getBalances().get(payeeId);
            to += amount;
            getBalances().put(payeeId, to);
          }
        }
      } catch (Throwable t) {
        pm.error(x, t);
        logger.warning(t.toString(), "payerId", payerId, "payerId", payeeId, "amount", amount);
        throw new RuntimeException(t);
      } finally {
        pm.log(x);
      }
      `
    },
  ]
});
