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
 */
public class ExpirationContactHoldAccCron implements ContextAgent {
  @Override
  public void execute(X x) {
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    Calendar today = Calendar.getInstance();
    today.setTime(new Date());
    today.add(Calendar.DAY_OF_MONTH, -30); // TODO: Make the expiry time configurable.

    ArraySink filteredInvoice = new ArraySink();
    invoiceDAO.where(
      AND(
        EQ(Invoice.STATUS, InvoiceStatus.PENDING_ACCEPTANCE),
        GTE(Invoice.PAYMENT_DATE, today.getTimeInMillis())
      )).select(filteredInvoice);

    for ( Object pendingInvoice : filteredInvoice.getArray() ) {
      Invoice invoice = (Invoice) pendingInvoice;
      invoice.setPaymentMethod(PaymentStatus.NONE);
      invoiceDAO.put(invoice);
    }
  }
}
