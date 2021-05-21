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
  package: 'net.nanopay.invoice',
  name: 'AutoDepositPendingAcceptance',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'check if Payee has a bankAccount to deposit any PENDING_ACCEPTANCE invoices',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AutoDepositPendingAcceptance(X x, DAO delegate) {
            setDelegate(delegate);
            setX(x);
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
        if ( obj == null ) {
          throw new RuntimeException("Cannot put null");
        }
        AuthService auth = (AuthService) x.get("auth");
        Invoice invoice = (Invoice) obj;
        DAO userDAO = ((DAO) x.get("localUserDAO")).inX(x);
        User payee = (User) userDAO.find(invoice.getPayeeId());
        if ( payee == null ) { return super.put_(x, invoice); }
        return super.put_(x, invoice);
      `
    },
    {
      name: 'doTransactionToBankAccount',
      visibility: 'protected',
      type: 'Void',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Invoice', name: 'invoice' },
        { type: 'User', name: 'payee' }
      ],
      javaCode: `
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        BankAccount bankAccount = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
        try {
          Transaction txn = new Transaction();
          txn.setPayeeId(invoice.getPayeeId());
          txn.setSourceAccount(invoice.getAccount());
          txn.setDestinationAccount(bankAccount.getId());
          txn.setAmount(invoice.getAmount());
          txn.setPayerId(invoice.getPayerId());
          txn.setInvoiceId(invoice.getId());
          invoice.setDestinationAccount(bankAccount.getId());
          txn = (Transaction)transactionDAO.put(txn);
        } catch (Exception e) {
          throw new RuntimeException("Auto transfer of funds from InvoiceId: " + invoice.getId() + " to payeeId: " + invoice.getPayeeId() + " failed.", e);
        }
      `
    },
    {
      name: 'checkIfUserHasVerifiedBankAccount',
      visibility: 'protected',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'User', name: 'payee' },
        { type: 'Invoice', name: 'invoice' }
      ],
      javaCode: `
        // Check if payee has a default BankAccount for invoice.getDestinationCurrency()
        BankAccount bankAccount = BankAccount.findDefault(x, payee, invoice.getDestinationCurrency());
        return bankAccount != null && bankAccount.getStatus().equals(BankAccountStatus.VERIFIED);
      `
    }
  ]
});
