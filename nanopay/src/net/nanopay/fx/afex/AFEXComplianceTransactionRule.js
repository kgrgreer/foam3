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
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'net.nanopay.account.Account',
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
          
          AFEXBeneficiaryComplianceTransaction txn = (AFEXBeneficiaryComplianceTransaction) obj;
          AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");

          Account sourceAccount = txn.findSourceAccount(x);
          Account destinationAccount = txn.findDestinationAccount(x);
          AFEXBeneficiary beneficiary = afexServiceProvider.getAFEXBeneficiary(x, destinationAccount.getOwner(), sourceAccount.getOwner());

          if ( beneficiary == null ) {
            ((Logger) x.get("logger")).error("beneficiary not found for transaction " + txn.getId() + " with beneficiary id " + destinationAccount.getOwner() + " with owner id " + sourceAccount.getOwner() );
            return;
          }

          if ( "Approved".equals(beneficiary.getStatus()) || "Active".equals(beneficiary.getStatus())) {
            txn.setStatus(TransactionStatus.COMPLETED);
          } else {
            DAO afexBeneficiaryDAO = (DAO) x.get("afexBeneficiaryDAO");
            DAO afexUserDAO = (DAO) x.get("afexUserDAO");
            AFEXUser afexUser =  (AFEXUser) afexUserDAO.find(EQ(AFEXUser.USER, beneficiary.getOwner()));
            if ( afexUser == null ) {
              ((Logger) x.get("logger")).error("AFEX Business not found for transaction " + txn.getId() + " with owner id " + beneficiary.getOwner() );
              return;
            }
            User user = User.findUser(x, afexUser.getUser());
            FindBeneficiaryResponse beneficiaryResponse = afexServiceProvider.findBeneficiary(beneficiary.getContact(),afexUser.getApiKey(), user.getSpid());
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
