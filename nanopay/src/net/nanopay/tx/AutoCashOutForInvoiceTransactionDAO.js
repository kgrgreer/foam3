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
  package: 'net.nanopay.tx',
  name: 'AutoCashOutForInvoiceTransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    When paying an invoice, immediately auto-cashOut to the payee's senderBankAccount_.
    TODO: only do if payee has this setting enabled.
  `,

  javaImports: [
    'foam.core.*',
    'foam.dao.*',
    'foam.nanos.auth.User',
    'java.util.*',

    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.model.*',
    'net.nanopay.tx.model.*',
    'static foam.mlang.MLang.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AutoCashOutForInvoiceTransactionDAO(DAO delegate) {
            setDelegate(delegate);
          }     
        `
        );
      }
    }
  ],

  methods: [
    // {
    //   name: 'put_',
    //   javaThrows: [ 'java.lang.RuntimeException' ],
    //   javaCode: `
    //     Transaction txn = (Transaction) super.put_(x, obj);

    //     // If paying an Invoice
    //     if ( txn.getInvoiceId() != 0 ) {
    //       DAO     invoiceDAO = (DAO) x.get("invoiceDAO");
    //       Invoice invoice    = (Invoice) invoiceDAO.find(txn.getInvoiceId());

    //       if ( invoice == null ) {
    //         throw new RuntimeException("Invoice not found");
    //       }

    //       invoice.setPaymentId(txn.getId());
    //       invoice.setPaymentDate(txn.getDate());
    //       invoice.setPaymentMethod(PaymentStatus.CHEQUE);
    //       invoiceDAO.put(invoice);

    //       DAO      accountDAO = (DAO) x.get("localAccountDAO");
    //       long id = (Long)((Account) accountDAO.find(txn.getDestinationAccount())).getOwner();
    //       ArraySink listSink      = (ArraySink) accountDAO
    //         .where(EQ(BankAccount.OWNER, id))
    //         .limit(1)
    //         .select(new ArraySink());
    //       List     list           = listSink.getArray();

    //       // And the Payee
    //       if ( list.size() > 0 ) {
    //         BankAccount bankAcc = (BankAccount) list.get(0);
    //         Transaction t       = new Transaction();

    //         t.setDestinationAccount(bankAcc.getId());
    //         t.setSourceAccount(txn.getSourceAccount());
    //         t.setAmount(txn.getTotal());
    //         t.setStatus(TransactionStatus.PENDING);

    //         DAO transacionDAO = (DAO) x.get("localTransactionDAO");
    //         transacionDAO.put(t);
    //       }
    //     }

    //     return txn;
    //   `
    // }
  ]
});
