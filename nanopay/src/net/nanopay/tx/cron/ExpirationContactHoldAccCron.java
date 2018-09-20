package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import foam.core.FObject;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.alterna.AlternaSFTPService;
import net.nanopay.tx.alterna.CsvUtil;
import static foam.mlang.MLang.*;
import java.util.Date;
import foam.core.*;
import foam.dao.*;
import java.util.*;
import java.util.Calendar;
import foam.dao.Sink;

/**
 * Every day this cronjob checks if invoice has passed the 30 day
 **/
public class ExpirationContactHoldAccCron
  implements ContextAgent
{
  @Override
  public void execute(X x) {
    DAO invoiceDAO_  = (DAO) x.get("invoiceDAO");
    Calendar endTime = Calendar.getInstance();
    Calendar today   = Calendar.getInstance();
    ArraySink filteredInvoice = new ArraySink();

    today.setTime(new Date());

    invoiceDAO_.where(
        AND(
          EQ( Invoice.STATUS, InvoiceStatus.PENDING_ACCEPTANCE), 
          GTE( Invoice.PAYMENT_DATE, today.getTimeInMillis() - (1000*60*60*24*30))
            //((endTime.setTime(Invoice.PAYMENT_DATE)).getTimeInMillis() + (1000*60*60*24*30)), today.getTimeInMillis())
          )).select(filteredInvoice);

    
    for(Object pendingInvoice : filteredInvoice.getArray()){
      invoiceDAO_.put((Invoice)pendingInvoice);
    }
  }
}
