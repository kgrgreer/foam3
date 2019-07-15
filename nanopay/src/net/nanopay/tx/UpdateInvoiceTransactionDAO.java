package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import static foam.mlang.MLang.EQ;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;
import net.nanopay.fx.FXTransaction;

import java.util.*;

public class UpdateInvoiceTransactionDAO extends ProxyDAO {

  Logger logger_;

  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
    logger_ = (Logger) x.get("logger");
    logger_ = new PrefixLogger(new Object[] {this.getClass().getSimpleName()}, logger_);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);

    Transaction transaction = (Transaction) obj;

    if ( SafetyUtil.isEmpty(transaction.getId()) &&
      ( transaction instanceof AbliiTransaction || transaction instanceof AscendantFXTransaction )
    ) {
      transaction = (Transaction) super.put_(x, obj);

      Invoice invoice = getInvoice(x, transaction);
      if ( invoice != null ) {
        invoice.setPaymentId(transaction.getId());

        // if ( invoice.getPaymentMethod().equals(PaymentStatus.PENDING_APPROVAL) ) {
        // invoice.setApprovedBy(((User) x.get("user")).getId());
        // }
        // Invoice status should be processing as default when the trasaction is created
        invoice.setPaymentMethod(PaymentStatus.PROCESSING);
        // AscendantFXTransaction has its own completion date
        if ( transaction instanceof AscendantFXTransaction ) {
          invoice.setPaymentDate(transaction.getCompletionDate());
        } else {
          invoice.setPaymentDate(generateEstimatedCreditDate(x, transaction));
        }
        invoiceDAO.put(invoice);

        // The invoice is not saved until after the transaction quoting
        // has succeeded. This decorator is predicated on invoiceId
        // for fast-fail.  Update all children with invoiceId.
        updateInvoice(x, transaction);
      }
      return transaction;
    }

    if ( SafetyUtil.isEmpty(transaction.getId()) ||
         transaction.getInvoiceId() == 0 ||
         transaction.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED ||
         ! ( transaction instanceof CITransaction ||
             transaction instanceof COTransaction ||
             transaction instanceof FXTransaction ) ) {
      return getDelegate().put_(x, obj);
    }

    Transaction old = (Transaction) getDelegate().find(transaction.getId());
    if ( ! ( transaction instanceof AbliiTransaction ) &&
         ( old == null ||
           old.getStatus() == transaction.getStatus() ) ) {
      return getDelegate().put_(x, obj);
    }

    Invoice invoice = getInvoice(x, transaction);
    if ( transaction.getStatus() == TransactionStatus.SENT &&
         transaction instanceof COTransaction ) {
        // only update the estimated completion date on the last CO leg.
      invoice.setPaymentDate(transaction.getCompletionDate());
      invoiceDAO.put(invoice);
      //logger_.debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "SENT/PENDING");
      return getDelegate().put_(x, obj);
    } else {
      // The remainder test 'state' which is only valid after the
      // transactions completes put().
      transaction = (Transaction) getDelegate().put_(x, obj);

      // With FastPay getState must be called on root to handle
      // composite transactions with CO and CI. Only COMPLETED
      // when both are COMPLETED, for example.
      TransactionStatus state = getRoot(x, transaction).getState(getX());

      if ( state != null &&
           state == TransactionStatus.COMPLETED &&
           invoice.getStatus() == InvoiceStatus.PAID ) {
        logger_.warning("Transaction", transaction.getId(), "invoice", invoice.getId(), "already PAID");
        throw new RuntimeException("Invoice already paid.");
      } else if ( state == TransactionStatus.DECLINED ||
                  state == TransactionStatus.REVERSE ||
                  state == TransactionStatus.REVERSE_FAIL ) {
        logger_.debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "DECLINED");
        // Do nothing. Our team will investigate and then manually set the status of the invoice.

        HashMap<String, Object> args = new HashMap();
        args.put("transactionId", transaction.getId());
        args.put("invoiceId", invoice.getId());
        invoice.setPaymentMethod(null);
        invoice.setPaymentDate(null);
        invoiceDAO.put(invoice);
        // Send a notification to the payment-ops team.
        FailedTransactionNotification notification = new FailedTransactionNotification.Builder(x)
          .setTransactionId(transaction.getId())
          .setInvoiceId(invoice.getId())
          .setEmailArgs(args)
          .build();
        DAO notificationDAO = ((DAO) x.get("notificationDAO")).inX(x);
        notificationDAO.put(notification);
      } else if ( state == TransactionStatus.COMPLETED ) {
        Calendar curDate = Calendar.getInstance();
        invoice.setPaymentDate(curDate.getTime());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put(invoice);
        // logger_.debug(transaction.getId(), transaction.getType(), transaction.getStatus(), state, transaction.getInvoiceId(), "COMPLETED/PAID");
      }
      return transaction;
    }
 }

  public Invoice getInvoice(X x, Transaction transaction) {
   DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
    Invoice invoice = transaction.findInvoiceId(x);
    if ( invoice == null ) {
      // TODO: create notification
      logger_.error("Transaction", transaction.getId(), "invoice", transaction.getInvoiceId(), "not found.");
      throw new RuntimeException("Invoice with id " + transaction.getInvoiceId() + " not found.");
    }
    return invoice;
 }

  private Date generateEstimatedCreditDate(X x, Transaction txn) {
    // NOTE: Alterna specific
    // CI + CO
    return CsvUtil.generateCompletionDate(x, CsvUtil.generateCompletionDate(x, new Date()));
  }

  public void updateInvoice(X x, Transaction transaction) {
    DAO dao = (DAO) x.get("localTransactionDAO");
    List children = ((ArraySink) dao.where(EQ(Transaction.PARENT, transaction.getId())).select(new ArraySink())).getArray();
    // REVIEW: the following is very slow going through authenticated transactionDAO rather than unauthenticated localTransactionDAO
    //      List children = ((ArraySink) getChildren(x).select(new ArraySink())).getArray();
    for ( Object obj : children ) {
      Transaction child = (Transaction) ((Transaction) obj).fclone();
      child.setInvoiceId(transaction.getInvoiceId());
      child = (Transaction) dao.put(child);
      updateInvoice(x, child);
    }
  }

  public Transaction getRoot(X x, Transaction transaction) {
    Transaction txn = transaction;
    Transaction parent = txn;
    while ( txn != null ) {
      parent = txn;
      txn = (Transaction) parent.findParent(x);
    }
    return parent;
  }
}
