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
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
    PM pm = PM.create(x, getName());

    Logger logger = (Logger) x.get("logger");
    long range = getMaxUserId() - getMinUserId() + 1;
    long payerId = (long) (Math.floor(Math.random() * range) + getMinUserId());
    long payeeId = (long) (Math.floor(Math.random() * range) + getMinUserId());
    long amount = (long) (Math.random() * 100);

    Transaction txn = new Transaction();
    txn.setPayerId(payerId);
    txn.setPayeeId(payeeId);
    txn.setAmount(amount);

    TransactionQuote quote = new TransactionQuote();
    quote.setRequestTransaction(txn);

    try {
      logger.info("execute", "put", "request");
      quote = (TransactionQuote) getClient(x, String.valueOf(payerId), "transactionPlannerDAO").put(quote);
      logger.info("execute", "put", "response", "Quote", quote.getRequestTransaction().getId(), "plans", quote.getPlans().length);
    } finally {
      pm.log(x);
    }
      `
    },
  ]
});
