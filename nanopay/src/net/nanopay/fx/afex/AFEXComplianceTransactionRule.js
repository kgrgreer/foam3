foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXComplianceTransactionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          
          if ( ! (obj instanceof AFEXBeneficiaryComplianceTransaction) ) {
            return;
          }
          AFEXBeneficiaryComplianceTransaction txn = (AFEXBeneficiaryComplianceTransaction) obj;

          if ( txn.getStatus() != TransactionStatus.PENDING ) {
            return;
          }
          
          AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");

          AFEXBeneficiary beneficiary = afexServiceProvider.getAFEXBeneficiary(x, txn.getPayeeId(), txn.getPayerId());

          if ( beneficiary == null ) {
            ((Logger) x.get("logger")).error("beneficiary not found for transaction " + txn.getId() + " with beneficiary id " + txn.getPayeeId() + " with owner id " + txn.getPayerId() );
            return;
          }

          if ( beneficiary.getStatus().equals("Active") ) {
            txn.setStatus(TransactionStatus.COMPLETED);
          } else {
            txn.setBeneficiaryId(beneficiary.getId());
          }

        }
      }, "AFEX Beneficiary Compliance");
      `
    }
  ]

});
