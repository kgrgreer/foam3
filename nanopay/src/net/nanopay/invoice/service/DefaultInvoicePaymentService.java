package net.nanopay.invoice.service;

import foam.core.ContextAwareSupport;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.NanoService;
import foam.nanos.auth.Group;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.AbliiTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;

public class DefaultInvoicePaymentService extends ContextAwareSupport implements InvoicePaymentService, NanoService {

  DAO transactionDAO_;
  DAO invoiceDAO_;
  DAO transactionPlannerDAO;
  DAO groupDAO_;

  public DefaultInvoicePaymentService(X x) {
    setX(x);
  }

  public void start() {
    transactionDAO_ = (DAO) getX().get("transactionDAO");
    invoiceDAO_ = (DAO) getX().get("invoiceDAO");
    transactionPlannerDAO = (DAO) getX().get("transactionPlannerDAO");
    groupDAO_ = (DAO) getX().get("groupDAO");
  }


  @Override
  public Invoice pay(X x, String invoiceId) {

    Invoice invoice = (Invoice) invoiceDAO_.inX(x).find(Long.parseLong(invoiceId));

    User user = ((Subject) x.get("subject")).getUser();

    validateInvoice(x, user, invoice);

    TransactionQuote quote = getQuote(x, invoice, user);

    transactionDAO_.inX(x).put(quote.getPlan());

    invoice = (Invoice) invoiceDAO_.inX(x)
      .find(invoice.getId());

    return invoice;
  }


  protected boolean isAbliiUser(User user, X x) {
    Group group = user.findGroup(x);
    return group != null && group.isDescendantOf("sme", groupDAO_);
  }

  protected void validateInvoice(X x, User user, Invoice invoice) {

    if ( invoice == null )
      throw new RuntimeException("Can't pay a null invoice");

    if ( invoice.getStatus().equals(InvoiceStatus.DRAFT) ) {
      throw new RuntimeException("Can't pay a draft invoice.");
    }

    invoice.validate(x);

    if ( user.getId() != invoice.getPayerId() )
      throw new RuntimeException("The user is not the payer of the invoice");

    if ( ! invoice.getStatus().equals(InvoiceStatus.UNPAID) && ! invoice.getStatus().equals(InvoiceStatus.OVERDUE) )
      throw new RuntimeException("Invoice payment was already initiated.");

    if ( invoice.findAccount(x) == null ) {
      throw new RuntimeException("Source account of the invoice is required.");
    }
  }

  protected TransactionQuote getQuote(X x, Invoice invoice, User user) {

    Transaction requestTransaction;
    if( isAbliiUser(user, x) ) {
      requestTransaction = new AbliiTransaction.Builder(x)
        .setSourceAccount(invoice.getAccount())
        .setDestinationAccount(invoice.getDestinationAccount())
        .setSourceCurrency(invoice.getSourceCurrency())
        .setDestinationCurrency(invoice.getDestinationCurrency())
        .setPayerId(invoice.getPayerId())
        .setPayeeId(invoice.getPayeeId())
        .setInvoiceId(invoice.getId())
        .build();
    } else {
      requestTransaction = new Transaction.Builder(x)
        .setSourceAccount(invoice.getAccount())
        .setDestinationAccount(invoice.getDestinationAccount())
        .setSourceCurrency(invoice.getSourceCurrency())
        .setDestinationCurrency(invoice.getDestinationCurrency())
        .setPayerId(invoice.getPayerId())
        .setPayeeId(invoice.getPayeeId())
        .setInvoiceId(invoice.getId())
        .build();
    }

    if ( invoice.getSourceCurrency().equals(invoice.getDestinationCurrency()) ) {
      requestTransaction.setAmount(invoice.getAmount());
    } else {
      requestTransaction.setDestinationAmount(invoice.getAmount());
    }

    TransactionQuote quote = new TransactionQuote.Builder(x)
      .setRequestTransaction(requestTransaction)
      .build();

    quote = (TransactionQuote) transactionPlannerDAO.inX(x).put(quote);

    if ( quote == null )
      throw new RuntimeException("No Quote for the transaction found.");

    return quote;
  }
}
