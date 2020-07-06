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
  package: 'net.nanopay.tx',
  name: 'AddLiquidTransactionAction',

  documentation: 'adds a liquid transaction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.List',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.LiquidCashTransactionType',
    'net.nanopay.tx.LiquidSummaryTransaction',
    'net.nanopay.tx.SourceLineItem',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              LiquidSummaryTransaction lst = new LiquidSummaryTransaction();
              DAO localTransactionDAO = ((DAO) x.get("localTransactionDAO"));
              lst.copyFrom(tx);
              lst.setId(java.util.UUID.randomUUID().toString());

              if ( ! (tx.getLineItems() == null || tx.getLineItems().length == 0) ) {
                TransactionLineItem[] tlis = tx.getLineItems();
                for ( TransactionLineItem tli : tlis ) {
                  if ( tli instanceof SourceLineItem ) {
                    if ( SafetyUtil.equals(tli.getNote(),"LiquidityService" ))
                      lst.setTransactionType(LiquidCashTransactionType.AUTOMATED_SWEEP);
                    break;
                  }
                }
              }

              lst = (LiquidSummaryTransaction) localTransactionDAO.put(lst);
              tx.setParent(lst.getId());
            }
         },"foreppend a LST");
      `
    }
  ]
});
