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
  package: 'net.nanopay.country.br.tx',
  name: 'ExchangeLimitTransactionCronAgent',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.LT',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  documentation: `ExchangeService timeouts will leave ExchangeLimitTransaction in a PENDING state.  This agent will periodically re-put the transaction to cause the Limit check to rule re-run.`,

  properties: [
    {
      documentation: `Time that a transaction must be in PENDING status before this agent acts.`,
      name: 'threshold',
      class: 'Long',
      value: 30000
    }
  ],

  methods: [
    {
      name: 'execute',
      javaCode: `
      DAO dao = (DAO) x.get("localTransactionDAO");
      Sink sink = new ExchangeLimitTransactionCronAgentSink(x, dao, getThreshold());
      dao
        .where(
          AND(
            INSTANCE_OF(ExchangeLimitTransaction.class),
            EQ(Transaction.STATUS, TransactionStatus.PENDING)
          )
        )
        .select(sink);
      `
    }
  ]
});
