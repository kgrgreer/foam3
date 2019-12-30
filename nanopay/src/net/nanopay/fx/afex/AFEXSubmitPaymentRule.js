foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXSubmitPaymentRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Rule to create submit payment to AFEX system when transaction is PENDING
    and reference number is null.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.text.DateFormat',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.Locale',
    'net.nanopay.fx.afex.AFEXServiceProvider',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {

          Logger logger = (Logger) x.get("logger");
          System.out.println("Executing AFEXSubmitPaymentRule");
          if ( ! (obj instanceof AFEXTransaction) ) {
            return;
          }
          
          AFEXTransaction transaction = (AFEXTransaction) obj.fclone();
          AFEXServiceProvider afexService = (AFEXServiceProvider) x.get("afexServiceProvider");

          if (transaction.getStatus() == TransactionStatus.PENDING 
            && SafetyUtil.isEmpty( transaction.getReferenceNumber() ) ) {

              try {
                Transaction txn = afexService.submitPayment(transaction);
                if ( ! SafetyUtil.isEmpty(txn.getReferenceNumber()) ) {
                  transaction.setStatus(TransactionStatus.SENT);
                  transaction.setReferenceNumber(txn.getReferenceNumber());
                  FXQuote fxQuote = (FXQuote) ((DAO) x.get("fxQuoteDAO")).find(Long.parseLong(transaction.getFxQuoteId()));            
                  if ( null != fxQuote ) {
                    Date date = null;
                    try{
                      DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.ENGLISH);
                      transaction.setCompletionDate(format.parse(fxQuote.getValueDate()));
                    } catch ( Exception e) {
                      ((Logger) x.get("logger")).error(" Error parsing FX quote value date ", e);
                    } 
                  }
                } else {
                  transaction.setStatus(TransactionStatus.DECLINED);
                  logger.error("Error submitting payment to AFEX.");
                }
                // update transaction
                ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
              } catch (Throwable t) {
                logger.error(" Error submitting payment for AfexTransaction " + transaction.getId(), t);
                transaction.setStatus(TransactionStatus.DECLINED);
                ((DAO) x.get("localTransactionDAO")).put_(x, transaction);
              }
          }
        }
      }, "Rule to create submit payment to AFEX system when transaction is PENDING and reference number is null.");
      `
    }
  ]

});
