package net.nanopay.contacts;

import java.util.ArrayList;
import java.util.List;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.admin.model.AccountStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;

import static foam.mlang.MLang.*;

public class CheckContactTransDAO extends ProxyDAO {
  public DAO transactionDAO_;

  public CheckContactTransDAO(X x, DAO delegate) {
    super(x, delegate);
    transactionDAO_ = ((DAO) x.get("localTransactionDAO")).inX(x);
  }

  @Override
  public FObject remove_(X x, FObject obj) {

    Contact contact = (Contact) obj;

    DAO accountDAO = (DAO) x.get("accountDAO");
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");

    List<Invoice> iv = ((ArraySink) invoiceDAO.where(OR(
      EQ(Invoice.PAYEE_ID, contact.getId()),
      EQ(Invoice.PAYER_ID, contact.getId())
    )).select(new ArraySink())).getArray();

    if ( contact.getBusinessStatus().equals(AccountStatus.ACTIVE) ) {
      throw new RuntimeException("You can't delete this contact");
    }

    List<Account> accounts = ((ArraySink) accountDAO.where(EQ(Account.OWNER, contact.getId())).select(new ArraySink())).getArray();
    
    for ( Account account : accounts ) {
      Transaction txn = (Transaction) transactionDAO_.find(
        OR(EQ(Transaction.DESTINATION_ACCOUNT, account.getId()),
           EQ(Transaction.SOURCE_ACCOUNT, account.getId()))
        );
      if ( txn != null ) throw new RuntimeException("Cannot delete this contact!");
    }

    for ( Invoice invoice : iv ) {
      Invoice v = (Invoice) invoiceDAO.find(
        OR(
          EQ( InvoiceStatus.UNPAID, invoice.getStatus()),
          EQ( InvoiceStatus.DRAFT, invoice.getStatus())
        )
      );
      invoiceDAO.remove(v);
    };
    return super.remove_(x, obj);
  }
}
