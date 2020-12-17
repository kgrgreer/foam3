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

 // TODO: Delete this class and enable "VerifyBankRule" after planner rewrite merge.
foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'RandomDepositBankAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.tx.alterna.AlternaVerificationTransaction',
    'net.nanopay.tx.bmo.cico.BmoVerificationTransaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.rbc.RbcVerificationTransaction'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionDAO',
      javaGetter: `
        return (DAO) getX().get("localTransactionDAO");
      `
    },
    {
      class: 'Boolean',
      name: 'useBMO'
    },
    {
      class: 'Boolean',
      name: 'useRBC'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RandomDepositBankAccountDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setUseBMO(true);
            setUseRBC(false);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof CABankAccount ) ) {
          return super.put_(x, obj);
        }
        BankAccount account = (BankAccount) obj;
        BankAccount oldAccount = (BankAccount) getDelegate().find_(x, obj);

        if ( oldAccount != null && 
          account.getBranchId() == oldAccount.getBranchId() &&
          account.getInstitutionNumber() == oldAccount.getInstitutionNumber() &&
          account.getAccountNumber() == oldAccount.getAccountNumber()) {
            return super.put_(x, obj);
          }
  
        // TODO: prevent a user from submitting their own status
        // generate random deposit amount and set in bank account model
        if ( BankAccountStatus.UNVERIFIED.equals(account.getStatus()) ) {
          long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
          account.setRandomDepositAmount(randomDepositAmount);
          super.put_(x, account);
          User user = ((Subject) x.get("subject")).getUser();
  
          // create new transaction and store
          VerificationTransaction transaction = null;
        if ( getUseBMO() ) {
            transaction = new BmoVerificationTransaction();
          } else if ( getUseRBC() ) {
            transaction = new RbcVerificationTransaction();
          } else {
            transaction = new AlternaVerificationTransaction();
          }
  
          transaction.setPayerId(user.getId());
          transaction.setDestinationAccount(account.getId());
          transaction.setAmount(randomDepositAmount);
          transaction.setSourceCurrency(account.getDenomination());
  
          getTransactionDAO().put_(x, transaction);
        }
  
        return super.put_(x, account);
      `
    }
  ]
});

