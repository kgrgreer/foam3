foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXComplianceTransactionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.EQ'
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

          if ( "Approved".equals(beneficiary.getStatus()) || "Active".equals(beneficiary.getStatus())) {
            txn.setStatus(TransactionStatus.COMPLETED);
          } else {
            DAO afexBeneficiaryDAO = (DAO) x.get("afexBeneficiaryDAO");
            DAO afexBusinessDAO = (DAO) x.get("afexBusinessDAO");
            AFEXBusiness afexBusiness =  (AFEXBusiness) afexBusinessDAO.find(EQ(AFEXBusiness.USER, beneficiary.getOwner()));
            if ( afexBusiness == null ) {
              ((Logger) x.get("logger")).error("AFEX Business not found for transaction " + txn.getId() + " with owner id " + beneficiary.getOwner() );
              return;
            }

            FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(beneficiary.getContact(),afexBusiness.getApiKey());
            if ( beneficiaryResponse.getStatus().equals("Approved") ) {
              beneficiary = (AFEXBeneficiary) beneficiary.fclone();
              beneficiary.setStatus("Active");
              afexBeneficiaryDAO.put(beneficiary);
              txn.setStatus(TransactionStatus.COMPLETED);

              DAO txnDAO = (DAO) x.get("localTransactionDAO");
              ArraySink txnSink = new ArraySink();
              txnDAO.where(EQ(AFEXBeneficiaryComplianceTransaction.BENEFICIARY_ID, beneficiary.getId())).select(txnSink);
              List<Transaction> txnList = txnSink.getArray();
  
              for ( Transaction afexTxn : txnList ) {
                afexTxn.setStatus(TransactionStatus.COMPLETED);
                txnDAO.put(afexTxn);
              }

            } else {
              txn.setBeneficiaryId(beneficiary.getId());
            }
          }

        }
      }, "AFEX Beneficiary Compliance");
      `
    }
  ]

});
