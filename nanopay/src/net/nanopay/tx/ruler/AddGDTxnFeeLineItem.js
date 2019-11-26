foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'AddGDTxnFeeLineItem',

  documentation: `
    This action of rule is for adding the fee line item of the trasaction
    for Grain Discovery.
  `,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `A custom action for the associated rule which can add fee
    to the cashout transactions.
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.FeeLineItem',
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
                  new FeeLineItem.Builder(getX())
                    .setName("Transaction Fee")
                    .setAmount(getFee())
                    .build()
                }, null);
              }
            }
          }
        }
      }, "GD Fee");
      `
    }
  ]
});
