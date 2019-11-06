package net.nanopay.contacts;

import java.util.List;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

/**
 * When deleting a contact, check if this contact is already associated with a
 * business or any transactions. If so, throw an error. The client will catch it let the user
 * know that they are unable to delete that contact from the list of contact. If not, delete
 * the invoice associate with this contact.
 */

public class CheckContactExistingTransaction extends ProxyDAO {

  public CheckContactExistingTransaction(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {

    Contact contact = (Contact) obj;
    
    DAO transactionDAO_ = ((DAO) x.get("localTransactionDAO"));
    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");

    if ( ! contact.getSignUpStatus().equals(ContactStatus.NOT_INVITED) ) {
      throw new RuntimeException("Cannot delete the contact because it is associated to a business.");
    }

    List<Account> accounts = ((ArraySink) accountDAO.where(EQ(Account.OWNER, contact.getId())).select(new ArraySink())).getArray();
    
    for ( Account account : accounts ) {
      Transaction txn = (Transaction) transactionDAO_.find(
        OR(
          EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
          EQ(Transaction.SOURCE_ACCOUNT, account.getId())
        )
      );
      if ( txn != null ) throw new RuntimeException("Cannot delete this contact because it's associated to transactions.");
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
  }
}
