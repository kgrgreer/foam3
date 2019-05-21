package net.nanopay.meter;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ArraySink;
import foam.mlang.MLang;
import foam.util.SafetyUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.model.TransactionEntity;
import java.util.UUID;

import java.util.*;
import java.util.function.Function;

public class PaymentSummaryReport {

  final static char SEPARATOR = ',';
  final static int NUM_ELEMENTS = 24;

  public <T> String nullCheckToString(T obj, Function<T, String> fn) {
    if ( obj != null ) return fn.apply(obj);
    return "";
  }

  private String buildCSVLine(String... args) {
    StringBuilder sb = new StringBuilder();
    for ( int i = 0; i < NUM_ELEMENTS; i++) {
      if ( i < args.length) sb.append(args[i]);
      if ( i < NUM_ELEMENTS - 1 ) sb.append(SEPARATOR);
      else sb.append('\n');
    }
    return sb.toString();
  }

  private void appendTransaction(StringBuilder builder, String invoiceID, Transaction transaction) {
    builder.append(buildCSVLine(
      invoiceID,
      nullCheckToString(transaction.getStatus(), Object::toString),
      transaction.getId(),
      transaction.getReferenceNumber(),
      transaction.getParent(),
      "N/A",
      nullCheckToString(transaction.getCreated(), Object::toString),
      nullCheckToString(transaction.getProcessDate(), Object::toString),
      nullCheckToString(transaction.getCompletionDate(), Object::toString),
      "N/A",
      transaction.getType(),
      "N/A",
      nullCheckToString(transaction.getPayer(), (payer) -> Long.toString(payer.getId())),
      nullCheckToString(transaction.getPayer(), TransactionEntity::getEmail),
      nullCheckToString(transaction.getPayer(), (payer) -> payer.getFirstName() + " " + payer.getLastName()),
      nullCheckToString(transaction.getPayee(), (payee) -> Long.toString(payee.getId())),
      nullCheckToString(transaction.getPayee(), TransactionEntity::getEmail),
      nullCheckToString(transaction.getPayee(), (payee) -> payee.getFirstName() + " " + payee.getLastName()),
      Long.toString(transaction.getAmount()),
      Long.toString(transaction.getDestinationAmount()),
      transaction.getSourceCurrency(),
      transaction.getDestinationCurrency(),
      "N/A",
      "N/A",
      "N/A"
    ));
  }

  private void buildSummaryReport(X x, StringBuilder builder, String invoiceID, Transaction root) {
    appendTransaction(builder, invoiceID, root);
    List children = ((ArraySink)root.getChildren(x).select(new ArraySink())).getArray();
    for ( Object obj : children ) {
      buildSummaryReport(x, builder, invoiceID, (Transaction) obj);
    }
  }
  
  // Create the transaction summary report
  public String createReport(X x, Date startDate, Date endDate) {

    // Set start date to the default if it isn't already set
    if (startDate == null)
    {
      Calendar c = Calendar.getInstance();
      c.add(Calendar.MONTH, -1);
      c.set(Calendar.DAY_OF_MONTH, 1);
      c.set(Calendar.HOUR_OF_DAY, 0);
      c.set(Calendar.MINUTE, 0);
      c.set(Calendar.SECOND, 0);
      c.set(Calendar.MILLISECOND, 0);
      startDate = c.getTime();
    }

    // Set the end date to the default if it isn't already set
    if (endDate == null)
    {
      Calendar c = Calendar.getInstance();
      c.set(Calendar.DAY_OF_MONTH, c.getActualMaximum(Calendar.DAY_OF_MONTH));
      c.set(Calendar.HOUR_OF_DAY, 23);
      c.set(Calendar.MINUTE, 59);
      c.set(Calendar.SECOND, 59);
      c.set(Calendar.MILLISECOND, 999);
      endDate = c.getTime();
    }

    // retrieve the daos
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    List transactions = ((ArraySink) transactionDAO.where(
      MLang.AND(
        MLang.OR(
          MLang.GTE(Transaction.CREATED, startDate),
          MLang.GTE(Transaction.PROCESS_DATE, startDate),
          MLang.GTE(Transaction.COMPLETION_DATE, startDate)
        ),
        MLang.LTE(Transaction.CREATED, endDate)
      )
    ).select(new ArraySink())).getArray();

    Map<Long, Transaction> rootTransactions = new HashMap<>();
    for ( Object obj : transactions ) {
      Transaction transaction = (Transaction) obj;
      Transaction parent = transaction;
      for ( Transaction iter = transaction; iter != null; iter = iter.findParent(x) ) {
        parent = iter;
      }
      rootTransactions.put(parent.getInvoiceId(), parent);
    }

    StringBuilder sb = new StringBuilder();
    sb.append(buildCSVLine(
      "Payment ID",
      "Transaction status",
      "Transaction ID",
      "Transaction Reference Number",
      "Transaction Parent ID",
      "Transaction ID from gateway",
      "Transaction request Date",
      "Transaction Process Date",
      "Date settled",
      "Settlement status",
      "Transaction type",
      "Dispute status",
      "Sender user ID",
      "Sender Name",
      "Sender Email",
      "Receiver user ID",
      "Receiver Name",
      "Receiver Email",
      "Amount attempted",
      "Amount settled",
      "Source Currency",
      "Destination Currency",
      "Location name",
      "Location ID",
      "Gateway name"
    ));

    for ( Map.Entry<Long, Transaction> entry : rootTransactions.entrySet() ) {
      TransactionStatus status = entry.getValue().getState(x);
      String invoiceID = "";
      long invoiceIDL = entry.getValue().getInvoiceId();
      if ( invoiceIDL == 0 ) invoiceID = UUID.randomUUID().toString();
      else invoiceID = Long.toString(invoiceIDL);
      sb.append(buildCSVLine(
        invoiceID,
        status.getName())
      );
      buildSummaryReport(x, sb, invoiceID, entry.getValue());
    }

    return sb.toString();
  }
}

