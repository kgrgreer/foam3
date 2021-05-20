/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.bank',
  name: 'AccountDetailDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: ``,

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.*',
    'net.nanopay.bank.AccountDetailSummary'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AccountDetailDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        FObject fObject = this.getDelegate().find_(x, id);
        if ( fObject == null ) {
          return fObject;
        }
        if (fObject instanceof BankAccount) {
          BankAccount bankAccount = (BankAccount) fObject;
          if ( ! bankAccount.getForContact() ) return fObject;
          
          AccountDetailSummary accountDetails = new AccountDetailSummary.Builder(x)
          .setAccountNumber(bankAccount.getAccountNumber())
          .setIban(bankAccount.getIban())
          .setInstitutionNumber(bankAccount.getInstitutionNumber())
          .setBranchId(bankAccount.getBranchId())
          .setSwiftCode(bankAccount.getSwiftCode())
          .build();

          bankAccount = (BankAccount) bankAccount.fclone();
          bankAccount.setAccountDetails(accountDetails);
          return bankAccount;
        }
        return fObject;
      `
    }
  ]
});
