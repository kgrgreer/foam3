package net.nanopay.meter.reports;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.CSVSink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.*;

public class ReportRejectedTransactions extends AbstractReport {

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
    CSVSink sink = new CSVSink.Builder(x)
      .setOf(transactionDAO.getOf())
      .setProps(new String[]{ "id", "created", "status", "type", "destinationAccount", "sourceAccount", "amount", "destinationAmount" })
      .build();

    transactionDAO.where(
      MLang.AND(
        MLang.OR(
          MLang.GTE(Transaction.CREATED, startDate),
          MLang.GTE(Transaction.PROCESS_DATE, startDate),
          MLang.GTE(Transaction.COMPLETION_DATE, startDate)
        ),
        MLang.LTE(Transaction.CREATED, endDate),
        MLang.OR(
          MLang.EQ(Transaction.STATUS, TransactionStatus.DECLINED),
          MLang.EQ(Transaction.STATUS, TransactionStatus.REVERSE),
          MLang.EQ(Transaction.STATUS, TransactionStatus.REVERSE_FAIL),
          MLang.EQ(Transaction.STATUS, TransactionStatus.CANCELLED),
          MLang.EQ(Transaction.STATUS, TransactionStatus.FAILED)
        )
      )
    ).orderBy(Transaction.INVOICE_ID).select(sink);

    return sink.getCsv();
  }

}
