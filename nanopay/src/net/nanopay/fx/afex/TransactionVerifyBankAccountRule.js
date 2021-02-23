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
  name: 'TransactionVerifyBankAccountRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Verify bank account on successful transaction.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.PartnerTransaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO accountDAO = (DAO) x.get("accountDAO");
          //check if source and destination account are bank account
          Boolean sourceIsBankAccount = ((Transaction) obj).findSourceAccount(x) instanceof  BankAccount;
          Boolean destinationIsBankAccount = ((Transaction) obj).findDestinationAccount(x) instanceof  BankAccount;
          
          if ( obj instanceof PartnerTransaction && sourceIsBankAccount && destinationIsBankAccount ) {
            BankAccount destinationAccount = (BankAccount) ((Transaction)obj).findDestinationAccount(x);
            BankAccount sourceAccount = (BankAccount) ((Transaction)obj).findSourceAccount(x);

            // check if account is verified by a trust agent( transaction, Flink, micro-deposit)
            if ( SafetyUtil.isEmpty(sourceAccount.getVerifiedBy()) ) {
              sourceAccount = (BankAccount) sourceAccount.fclone();
              sourceAccount.setVerifiedBy("TRANSACTION");
              accountDAO.put(sourceAccount);
            }
            if ( SafetyUtil.isEmpty(destinationAccount.getVerifiedBy()) ) {
              destinationAccount = (BankAccount) destinationAccount.fclone();
              destinationAccount.setVerifiedBy("TRANSACTION");
              accountDAO.put(destinationAccount);
            }
          } else if ( obj instanceof CITransaction && sourceIsBankAccount ) {
            BankAccount sourceAccount = (BankAccount) ((Transaction)obj).findSourceAccount(x);
            if ( SafetyUtil.isEmpty(sourceAccount.getVerifiedBy()) ) {
              sourceAccount = (BankAccount) sourceAccount.fclone();
              sourceAccount.setVerifiedBy("TRANSACTION");
              accountDAO.put(sourceAccount);
            }
          } else if ( obj instanceof COTransaction && destinationIsBankAccount ) {
            BankAccount destinationAccount = (BankAccount) ((Transaction)obj).findDestinationAccount(x);
            if ( SafetyUtil.isEmpty(destinationAccount.getVerifiedBy()) ) {
              destinationAccount = (BankAccount) destinationAccount.fclone();
              destinationAccount.setVerifiedBy("TRANSACTION");
              accountDAO.put(destinationAccount);
            }
          }
        }
      }, "verify bank account on successful transaction");
      `
    }
  ]
});
