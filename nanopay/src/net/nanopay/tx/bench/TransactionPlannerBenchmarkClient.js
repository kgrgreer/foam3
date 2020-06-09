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
  name: 'TransactionPlannerBenchmarkClient',
  extends: 'net.nanopay.tx.bench.TransactionBenchmarkClient',

  javaImports: [
    'foam.nanos.app.AppConfig',
    'foam.nanos.pm.PM',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
  ],

  methods: [
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

    Transaction txn = new Transaction();
    txn.setSourceAccount(sourceId);
    txn.setDestinationAccount(destinationId);
    txn.setAmount(amount);

    TransactionQuote quote = new TransactionQuote();
    quote.setRequestTransaction(txn);

    try {
      synchronized (this) {
        setTransactions(getTransactions() +1);
      }
//      getLogger().info("execute", "put", "request");
      quote = (TransactionQuote) getClient().put(quote);
//      getLogger().info("execute", "put", "response", "Quote", quote.getRequestTransaction().getId(), "plans", quote.getPlans().length);
    } catch ( Throwable t ) {
      getLogger().error(t.getMessage(), t);
    } finally {
      pm.log(x);
    }
      `
    },
  ]
});
