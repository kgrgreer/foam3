package net.nanopay.tx.cron;

import foam.core.ContextAgent;
import foam.core.*;
import foam.dao.*;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import static foam.mlang.MLang.*;

import java.util.*;


/**
 * Every day this cronjob checks if any invoice with InvoiceStatus.PENDING_ACCEPTANCE
 * has exceeded the 30 day expiration.
 * if the invoice has expired transfer the payment back to User default account from User Holding account
 * User Holding account is for payments to external users
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
          )).select(filteredInvoice);

    
    for(Object pendingInvoice : filteredInvoice.getArray()){
      Invoice invoice = (Invoice) pendingInvoice;
      invoice.setPaymentMethod(PaymentStatus.NONE);
      invoiceDAO_.put(invoice);
    }
  }
}
