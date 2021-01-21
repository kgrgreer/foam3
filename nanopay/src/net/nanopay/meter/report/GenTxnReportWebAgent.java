package net.nanopay.meter.report;

import foam.core.Currency;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.http.WebAgent;
import foam.nanos.logger.Logger;
import net.nanopay.meter.reports.AbstractReport;
import net.nanopay.tx.BulkTransaction;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.HistoricStatus;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.ZoneId;
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

    LocalDate startDate = LocalDate.parse(req.getParameter("startDate"));
    LocalDate endDate = LocalDate.parse(req.getParameter("endDate"));

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
      long totalFee = 0;
      int totalCount = 0;

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
          if ( ! statusHistoryArr[j].getTimeStamp().after( Date.from(endDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()) )
            && ! statusHistoryArr[j].getTimeStamp().before( Date.from(startDate.atStartOfDay(ZoneId.systemDefault()).toInstant())) ) {

            Currency currency = (Currency) currencyDAO.find(txn.getSourceCurrency());
            Transaction rootTxn = txn.findRoot(x);

            String bodyString = this.buildCSVLine(
              11,
              txn.getId(),
              rootTxn != null ? rootTxn.getId() : "N/A" ,
              txn.getCreated().toString(),
              txn.getType(),
              Long.toString(txn.findDestinationAccount(x).getOwner()),
              Long.toString(txn.findSourceAccount(x).getOwner()),
              StringEscapeUtils.escapeCsv(currency.format(-txn.getTotal(x, txn.getSourceAccount()))),
              currency.getId(),
              StringEscapeUtils.escapeCsv(currency.format(txn.getCost())),
              currency.getId(),
              txn.getStatus().toString()
            );

            writer.write(bodyString);

            if (currency.getId().equals("CAD")) {
              if (txn instanceof CITransaction) {
                ciAmountCAD += -txn.getTotal(x, txn.getSourceAccount());
              } else if (txn instanceof COTransaction) {
                coAmountCAD += -txn.getTotal(x, txn.getSourceAccount());
              } else if ( txn instanceof DigitalTransaction &&
                          txn.getCost() > 0 ) {
                  totalCount += 1;
                  totalFee += txn.getCost();
              }
            }
            break;
          }
        }
      }

      Currency currencyCAD = (Currency) currencyDAO.find("CAD");

      String sumCIString = this.customCSVLine(
        "Total CI Amount",
        StringEscapeUtils.escapeCsv(currencyCAD.format(ciAmountCAD)),
        currencyCAD.getId()
      );

      String sumCOString = this.customCSVLine(
        "Total CO Amount",
        StringEscapeUtils.escapeCsv(currencyCAD.format(coAmountCAD)),
        currencyCAD.getId()
      );

      String sumFeeString = this.customCSVLine(
        "Total Transaction Fee",
        StringEscapeUtils.escapeCsv(currencyCAD.format(totalFee)),
        currencyCAD.getId()
      );

      String minFeeString = new String();
      if ( MIN_MONTHLY_PAYMENT > totalFee ) {
        minFeeString = this.customCSVLine(
          "Minimum Monthly Payment",
          StringEscapeUtils.escapeCsv(currencyCAD.format(MIN_MONTHLY_PAYMENT)),
          currencyCAD.getId()
        );
      }

      String totalDue = this.customCSVLine(
        "Total Due",
        StringEscapeUtils.escapeCsv(currencyCAD.format(totalFee > MIN_MONTHLY_PAYMENT ? totalFee : MIN_MONTHLY_PAYMENT)),
        currencyCAD.getId()
      );

      writer.write(sumCIString);
      writer.write(sumCOString);
      writer.write(sumFeeString);

      if ( MIN_MONTHLY_PAYMENT > totalFee ) {
        writer.write(minFeeString);
      }

      writer.write(totalDue);

      writer.flush();
      writer.close();
    } catch (IOException e) {
      Logger logger = (Logger) x.get("logger");
      logger.log(e);
    }
  }

  private String customCSVLine(String title, String amount, String currency) {
    return this.buildCSVLine(
      11,
      "",
      "",
      "",
      title,
      "",
      "",
      amount,
      currency,
      "",
      "",
      ""
    );
  }
}
