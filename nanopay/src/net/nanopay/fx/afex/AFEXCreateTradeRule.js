foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXCreateTradeRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED 
    and trade not yet created.`,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAwareAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) getX().get("logger");
          System.out.println("Executing AFEXCreateTradeRule");
          if ( ! (obj instanceof AFEXTransaction) ) {
            return;
          }
          
          AFEXTransaction transaction = (AFEXTransaction) obj.fclone();
          AFEXServiceProvider afexService = (AFEXServiceProvider) getX().get("afexServiceProvider");
          System.out.println("getAfexTradeResponseNumber is : " + transaction.getAfexTradeResponseNumber());
          System.out.println("getStatus is : " + transaction.getStatus());
          if (transaction.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED 
            && transaction.getAfexTradeResponseNumber() == 0 ) {
            try {
              int result = afexService.createTrade(transaction);
              System.out.println("setAfexTradeResponseNumber is : " + result);
              transaction.setAfexTradeResponseNumber(result);
              // update transaction
              System.out.println("getAfexTradeResponseNumber is : " + transaction.getAfexTradeResponseNumber());
              ((DAO) getX().get("localTransactionDAO")).put_(getX(), transaction);
            } catch (Throwable t) {
              logger.error(" Error creating trade for AfexTransaction " + transaction.getId(), t);
            }
          }
        }

      }, "Rule to create trade on AFEX system when transaction is PENDING_PARENT_COMPLETED and trade not yet created.");
      `
    }
  ]

});
