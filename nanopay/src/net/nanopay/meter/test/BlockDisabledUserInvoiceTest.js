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
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserInvoiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.invoice.model.Invoice',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x_ = x;
        setUp();
        BlockDisabledUserInvoiceTest_when_payer_is_disabled();
        BlockDisabledUserInvoiceTest_when_payee_is_disabled();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // DAOs
        userDAO_ = (DAO) x_.get("localUserDAO");
        accountDAO_ = (DAO) x_.get("localAccountDAO");
        invoiceDAO_ = (DAO) x_.get("invoiceDAO");
      `
    },
    {
      name: 'setUserStatus',
      type: 'foam.nanos.auth.User',
      args: [
        { type: 'String', name: 'email' },
        { type: 'net.nanopay.admin.model.AccountStatus', name: 'status' }
      ],
      javaCode: `
        User user = (User) userDAO_.find(MLang.EQ(User.EMAIL, email));
        if ( user == null ) {
          user = new User.Builder(x_)
            .setEmail(email)
            .setFirstName("Francis")
            .setLastName("Filth")
            .setEmailVerified(true).build();
        } else {
          user = (User) user.fclone();
        }
        user.setStatus(status);
        return (User) userDAO_.put(user).fclone();
      `
    },
    {
      name: 'findOrCreateBankAccount',
      type: 'net.nanopay.bank.CABankAccount',
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' }
      ],
      javaCode: `
        CABankAccount bankAccount = (CABankAccount) accountDAO_.find(
          MLang.AND(
            MLang.EQ(CABankAccount.OWNER, user.getId()),
            MLang.INSTANCE_OF(CABankAccount.class)));
        if ( bankAccount == null ) {
          bankAccount = new CABankAccount.Builder(x_)
            .setAccountNumber("2131412443534534")
            .setOwner(user.getId()).build();
        } else {
          bankAccount = (CABankAccount) bankAccount.fclone();
        }
        bankAccount.setStatus(BankAccountStatus.VERIFIED);
        return (CABankAccount) accountDAO_.put(bankAccount).fclone();
      `
    },
    {
      name: 'buildInvoice',
      type: 'net.nanopay.invoice.model.Invoice',
      args: [
        { type: 'foam.nanos.auth.User', name: 'payer' },
        { type: 'foam.nanos.auth.User', name: 'payee' }
      ],
      javaCode: `
        return new Invoice.Builder(x_)
          .setPayerId(payer.getId())
          .setPayeeId(payee.getId())
          .setAccount(findOrCreateBankAccount(payer).getId())
          .setSourceCurrency("CAD")
          .setDestinationCurrency("CAD")
          .setAmount(100l).build();
      `
    },
    {
      name: 'BlockDisabledUserInvoiceTest_when_payer_is_disabled',
      javaCode: `
        User disabledUser = setUserStatus("disabled_user@nanopay.net", AccountStatus.DISABLED);
        User payee = setUserStatus("test_user@nanopay.net", AccountStatus.ACTIVE);
        Invoice invoice = buildInvoice(disabledUser, payee);

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Payer user is disabled.",
            IllegalStateException.class
          ),
          "Create invoice with disabled payer user throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserInvoiceTest_when_payee_is_disabled',
      javaCode: `
        User disabledUser = setUserStatus("disabled_user@nanopay.net", AccountStatus.DISABLED);
        User payer = setUserStatus("test_user@nanopay.net", AccountStatus.ACTIVE);
        Invoice invoice = buildInvoice(payer, disabledUser);

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Payee user is disabled.",
            IllegalStateException.class
          ),
          "Create invoice with disabled payee user throws RuntimeException"
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private foam.core.X x_;
          private foam.dao.DAO userDAO_;
          private foam.dao.DAO accountDAO_;
          private foam.dao.DAO invoiceDAO_;
        `);
      }
    }
  ]
});
