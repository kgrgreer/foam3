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
  package: 'net.nanopay.tx.ruler',
  name: 'AddGDTxnFeeLineItem',

  documentation: `
    This action of rule is for adding the fee line item of the trasaction
    for Grain Discovery.
    A custom action for the associated rule which can add fee
    to the cashout transactions.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'fee'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          TransactionQuote transactionQuote = (TransactionQuote) obj;

          // Iterate through the transaction array
          // (In current situation, the array only has one item)
          for ( Transaction transaction : transactionQuote.getPlans()) {
            if (transaction instanceof DigitalTransaction && transaction.getCost() == 0 ) {

              DAO userDAO = (DAO) x.get("localUserDAO");
              User payee = (User) userDAO.find_(x, transaction.getPayeeId());

              DigitalAccount defaultDigitalAccount = DigitalAccount.findDefault(x, payee, transaction.getDestinationCurrency());
              LiquiditySettings digitalAccLiquid = defaultDigitalAccount.findLiquiditySetting(x);

              // Check if the default digital account of the payee has the liqudity setting or not
              if ( digitalAccLiquid == null || ! digitalAccLiquid.getHighLiquidity().getEnabled()) {
                // Set fee lineitem for digital transaction to farmers
                transaction.addLineItems(new TransactionLineItem[] {
                  new InvoicedFeeLineItem.Builder(getX())
                    .setName("Transaction Fee")
                    .setAmount(getFee())
                    .build()
                });
              }
            }
          }
        }
      }, "GD Fee");
      `
    }
  ]
});
