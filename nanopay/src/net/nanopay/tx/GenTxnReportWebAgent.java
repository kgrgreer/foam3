package net.nanopay.tx;

import foam.core.Currency;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;
import net.nanopay.meter.reports.AbstractReport;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import org.apache.commons.text.StringEscapeUtils;

public class GenTxnReportWebAgent extends AbstractReport implements WebAgent {


  @Override
  public void execute(X x) {
    DAO  txnDAO  = (DAO) x.get("localTransactionDAO");
    DAO currencyDAO = (DAO) x.get("currencyDAO");

    HttpServletRequest req = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    String downloadName = "txnReport.csv";
    response.setContentType("text/csv");
    response.setHeader("Content-Disposition", "attachment;fileName=\"" + downloadName + "\"");

    SimpleDateFormat formatter = new SimpleDateFormat("E MMM dd yyyy");

    Date startDate = null;
    try {
      startDate = formatter.parse(req.getParameter("startDate"));
    } catch (ParseException e) {
      e.printStackTrace();
    }
    Date endDate = null;
    try {
      endDate = formatter.parse(req.getParameter("endDate"));
    } catch (ParseException e) {
      e.printStackTrace();
    }

    try {
      OutputStream outputStream = response.getOutputStream();
      String titleString = this.buildCSVLine(
        11,
        "Transaction ID",
        "Parent Transaction",
        "Created Time",
        "Type",
        "Payee ID",
        "Payer iD",
        "Payment Amount",
        "Payment Currency",
        "Fee",
        "Fee Currency",
        "Status"
      );

      outputStream.write(titleString.getBytes());

      List<Transaction> transactionList = ((ArraySink) txnDAO.select(new ArraySink())).getArray();
      for ( Transaction txn : transactionList ) {
        HistoricStatus[] statusHistoryArr = txn.getStatusHistory();
        for ( int j = statusHistoryArr.length - 1; j >= 0; j-- ) {
          if ( ! statusHistoryArr[j].getTimeStamp().after(endDate) && ! statusHistoryArr[j].getTimeStamp().before(startDate) ) {

            Currency currency = (Currency) currencyDAO.find(txn.getSourceCurrency());

            String bodyString = this.buildCSVLine(
              11,
              txn.getId(),
              SafetyUtil.isEmpty(txn.getParent()) ? "N/A" : txn.getParent(),
              txn.getCreated().toString(),
              txn.getType(),
              Long.toString(txn.findDestinationAccount(x).getOwner()),
              Long.toString(txn.findSourceAccount(x).getOwner()),
              StringEscapeUtils.escapeCsv(currency.format(txn.getAmount())),
              currency.getPrimaryKey().toString(),
              StringEscapeUtils.escapeCsv(currency.format(txn.getCost())),
              currency.getPrimaryKey().toString(),
              txn.getStatus().toString()
            );

            outputStream.write(bodyString.getBytes());
            break;
          }
        }
      }
      outputStream.flush();
      outputStream.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
