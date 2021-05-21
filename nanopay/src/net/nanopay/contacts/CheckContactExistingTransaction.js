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
  package: 'net.nanopay.contacts',
  name: 'CheckContactExistingTransaction',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    When deleting a contact, check if this contact is already associated with a
    business or any transactions. If so, throw an error. The client will catch it let the user
    know that they are unable to delete that contact from the list of contact. If not, delete
    the invoice associate with this contact.
  `,

  javaImports: [
    'java.util.List',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.tx.model.Transaction',
    
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'DELETE_ERROR_MSG', message: 'Cannot delete this contact because it\'s associated to transactions' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CheckContactExistingTransaction(X x, DAO delegate) {
            super(x, delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'remove_',
      javaCode: `
        Contact contact = (Contact) obj;
    
        DAO transactionDAO_ = ((DAO) x.get("localTransactionDAO"));
        DAO accountDAO = (DAO) x.get("accountDAO");
        DAO invoiceDAO = (DAO) x.get("invoiceDAO");


        List<Account> accounts = ((ArraySink) accountDAO.where(EQ(Account.OWNER, contact.getId())).select(new ArraySink())).getArray();
        
        for ( Account account : accounts ) {
          Transaction txn = (Transaction) transactionDAO_.find(
            OR(
              EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
              EQ(Transaction.SOURCE_ACCOUNT, account.getId())
            )
          );
          if ( txn != null ) throw new RuntimeException(DELETE_ERROR_MSG);
        }

        List<Invoice> iv = ((ArraySink) invoiceDAO.where(OR(
          EQ(Invoice.PAYEE_ID, contact.getId()),
          EQ(Invoice.PAYER_ID, contact.getId())
        )).select(new ArraySink())).getArray();

        for ( Invoice invoice : iv ) {
          Invoice v = (Invoice) invoiceDAO.find(
            OR(
              EQ( InvoiceStatus.UNPAID, invoice.getStatus()),
              EQ( InvoiceStatus.DRAFT, invoice.getStatus()),
              EQ( InvoiceStatus.OVERDUE, invoice.getStatus())
            )
          );
          if ( v != null )invoiceDAO.remove(v);
        };

        return super.remove_(x, obj);
      `
    }
  ]
});
