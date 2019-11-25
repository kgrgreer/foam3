package net.nanopay.tx;

import foam.core.Currency;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.util.SafetyUtil;
import net.nanopay.meter.reports.AbstractReport;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import org.apache.commons.text.StringEscapeUtils;

import static foam.mlang.MLang.*;

public class GenTxnReportWebAgent extends AbstractReport implements WebAgent {

  private final static long MIN_MONTHLY_PAYMENT = 250000;

  @Override
  public void execute(X x) {
    DAO  txnDAO  = (DAO) x.get("localTransactionDAO");
    DAO currencyDAO = (DAO) x.get("currencyDAO");

    HttpServletRequest req = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);

    String fileName = "txnReport.csv";
    response.setContentType("text/csv");
    response.setHeader("Content-Disposition", "attachment;fileName=\"" + fileName + "\"");

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
      PrintWriter writer = response.getWriter();
      String titleString = this.buildCSVLine(
        11,
        "Transaction ID",
        "Parent Transaction",
        "Created Time",
        "Type",
        "Payee ID",
        "Payer iD",
        "Amount",
        "Currency",
        "Fee",
        "Fee Currency",
        "Status"
      );

      writer.write(titleString);

      long ciAmountCAD = 0;
      long coAmountCAD = 0;
      long coFee = 0;

      List<Transaction> transactionList = ((ArraySink) txnDAO
        .where(
          OR(
            INSTANCE_OF(CITransaction.class),
            INSTANCE_OF(COTransaction.class),
            INSTANCE_OF(DigitalTransaction.class),
            INSTANCE_OF(BulkTransaction.class)
          )
        )
        .select(new ArraySink())).getArray();

      for ( Transaction txn : transactionList ) {
        HistoricStatus[] statusHistoryArr = txn.getStatusHistory();
        for ( int j = statusHistoryArr.length - 1; j >= 0; j-- ) {
          if ( ! statusHistoryArr[j].getTimeStamp().after(endDate)
            && ! statusHistoryArr[j].getTimeStamp().before(startDate) ) {

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
              currency.getId(),
              StringEscapeUtils.escapeCsv(currency.format(txn.getCost())),
              currency.getId(),
              txn.getStatus().toString()
            );

            writer.write(bodyString);

            if (currency.getId().equals("CAD")) {
              if (txn instanceof CITransaction) {
                ciAmountCAD = ciAmountCAD + txn.getAmount();
              } else if (txn instanceof COTransaction) {
                coAmountCAD = coAmountCAD + txn.getAmount();
                coFee = coFee + txn.getCost();
              }
            }
            break;
          }
        }
      }

      Currency currencyCAD = (Currency) currencyDAO.find("CAD");

      String sumCIString = this.buildCSVLine(
        11,
        "",
        "",
        "",
        "Total CI Amount",
        "",
        "",
        StringEscapeUtils.escapeCsv(currencyCAD.format(ciAmountCAD)),
        currencyCAD.getId(),
        "",
        "",
        ""
      );

      String sumCOString = this.buildCSVLine(
        11,
        "",
        "",
        "",
        "Total CO Amount",
        "",
        "",
        StringEscapeUtils.escapeCsv(currencyCAD.format(coAmountCAD)),
        currencyCAD.getId(),
        "",
        "",
        ""
      );

      String sumFee = currencyCAD.format(coFee);
      if (coFee <= MIN_MONTHLY_PAYMENT ) {
        sumFee = sumFee
          + "(Minimum Payment: " + currencyCAD.format(MIN_MONTHLY_PAYMENT) + ")";
      }

      String sumFeeString = this.buildCSVLine(
        11,
        "",
        "",
        "",
        "CO Fee",
        "",
        "",
        StringEscapeUtils.escapeCsv(sumFee),
        currencyCAD.getId(),
        "",
        "",
        ""
      );

      writer.write(sumCIString);
      writer.write(sumCOString);
      writer.write(sumFeeString);
      writer.flush();
      writer.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
