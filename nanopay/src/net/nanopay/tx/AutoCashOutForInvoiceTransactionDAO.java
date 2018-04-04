package net.nanopay.tx;

import foam.core.*;
import foam.dao.*;
import foam.nanos.auth.User;
import java.util.*;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.*;
import net.nanopay.tx.model.*;
import static foam.mlang.MLang.*;

/**
 * When paying an invoice, immediately auto-cashOut to the payee's bankAccount.
 * TODO: only do if payee has this setting enabled.
 **/
public class AutoCashOutForInvoiceTransactionDAO
  extends ProxyDAO
{

  public AutoCashOutForInvoiceTransactionDAO(DAO delegate) {
    setDelegate(delegate);
  }

  // @Override
  public FObject put_(X x, FObject obj)
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

      DAO      bankAccountDAO = (DAO) x.get("localBankAccountDAO");
      ArraySink listSink      = (ArraySink) bankAccountDAO
        .where(EQ(BankAccount.OWNER, txn.getPayeeId()))
        .limit(1)
        .select(new ArraySink());
      List     list           = listSink.getArray();

      // And the Payee
      if ( list.size() > 0 ) {
        BankAccount bankAcc = (BankAccount) list.get(0);
        Transaction t       = new Transaction();

        t.setPayeeId(txn.getPayeeId());
        t.setPayerId(txn.getPayerId());
        t.setAmount(txn.getTotal());
        t.setType(TransactionType.CASHOUT);
        t.setStatus(TransactionStatus.PENDING);
        t.setBankAccountId(bankAcc.getId());

        DAO transacionDAO = (DAO) x.get("localTransactionDAO");
        transacionDAO.put(t);
      }
    }

    return txn;
  }
}
