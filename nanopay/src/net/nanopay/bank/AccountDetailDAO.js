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
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.Transfer',
    'java.util.List',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.bank.AccountDetailModel'
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
      name: 'put_',
      javaCode: `
        if (!(obj instanceof BankAccount)) {
          return super.put_(x, obj);
        }

        BankAccount bankAccount = (BankAccount) obj;

        AccountDetailModel ad = new AccountDetailModel.Builder(x)
          .setAccountNumber(bankAccount.getAccountNumber())
          .setIban(bankAccount.getIban())
          .setInstitutionNumber(bankAccount.getInstitutionNumber())
          .setBranchId(bankAccount.getBranchId())
          .setSwiftCode(bankAccount.getSwiftCode())
          .build();

        bankAccount = (BankAccount) bankAccount.fclone();
        // bankAccount.setSummary(ad);
        return super.put_(x, bankAccount);
      `
    }
  ]
});
