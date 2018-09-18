package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.alterna.AlternaSFTPService;
import net.nanopay.tx.alterna.CsvUtil;
import static foam.mlang.MLang.EQ;

import java.util.Calendar;

/**
 * Every day this cronjob checks if invoice has passed the 30 day
 **/
public class ExpirationContactHoldAccCron
  implements ContextAgent
{
  @Override
  public void execute(X x) {
    DAO invoiceDAO_  = (DAO) x.get("invoiceDAO");
    Calendar   today = Calendar.getInstance();

    //ArraySink filteredInvoice = invoiceDAO_.select().where(AND(EQ(Invoice.STATUS, InvoiceStatus.PENDING_ACCEPTANCE), LT(Invoice.PAYMENTDATE + 30days, Date.now()) );

    //filteredInvoice.

  }
}
