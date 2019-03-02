package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import java.util.*;

import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.*;
import net.nanopay.tx.model.*;
import static foam.mlang.MLang.*;

/**
 * When paying an invoice, immediately auto-cashOut to the payee's senderBankAccount_.
 * TODO: only do if payee has this setting enabled.
 **/
public class AutoCashOutForInvoiceTransactionDAO
  extends ProxyDAO
{

  public AutoCashOutForInvoiceTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  // @Override
  /*public FObject put_(X x, FObject obj)
    throws RuntimeException
  {
    Transaction txn = (Transaction) super.put_(x, obj);

    // If paying an Invoice
    if ( txn.getInvoiceId() != 0 ) {
      DAO     invoiceDAO = (DAO) x.get("invoiceDAO");
      Invoice invoice    = (Invoice) invoiceDAO.find(txn.getInvoiceId());

      if ( invoice == null ) {
        throw new RuntimeException("Invoice not found");
      }

      invoice.setPaymentId(txn.getId());
      invoice.setPaymentDate(txn.getDate());
      invoice.setPaymentMethod(PaymentStatus.CHEQUE);
      invoiceDAO.put(invoice);

      DAO      accountDAO = (DAO) x.get("localAccountDAO");
      long id = (Long)((Account) accountDAO.find(txn.getDestinationAccount())).getOwner();
      ArraySink listSink      = (ArraySink) accountDAO
        .where(EQ(BankAccount.OWNER, id))
        .limit(1)
        .select(new ArraySink());
      List     list           = listSink.getArray();

      // And the Payee
      if ( list.size() > 0 ) {
        BankAccount bankAcc = (BankAccount) list.get(0);
        Transaction t       = new Transaction();

        t.setDestinationAccount(bankAcc.getId());
        t.setSourceAccount(txn.getSourceAccount());
        t.setAmount(txn.getTotal());
        t.setStatus(TransactionStatus.PENDING);

        DAO transacionDAO = (DAO) x.get("localTransactionDAO");
        transacionDAO.put(t);
      }
    }

    return txn;
   }*/
}
