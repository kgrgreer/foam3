package net.nanopay.invoice;

import foam.core.ContextAwareSupport;
import foam.mlang.MLang;
import foam.dao.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.text.SimpleDateFormat;
import foam.core.FObject;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.tx.model.Transaction;
import net.nanopay.invoice.model.PaymentStatus;
import static foam.mlang.MLang.*;

public class ScheduleInvoiceCron
  extends    ContextAwareSupport
  {
    protected DAO    invoiceDAO_;
    protected DAO    localTransactionDAO_;

    public void fetchInvoices() {
      try{
        System.out.println("Finding scheduled Invoices...");
        ListSink sink = (ListSink) invoiceDAO_.where(
          AND(
            EQ(Invoice.PAYMENT_ID, 0),
            EQ(Invoice.PAYMENT_METHOD, PaymentStatus.NONE),
            NEQ(Invoice.PAYMENT_DATE, null)
          )
        ).select(new ListSink());
          List invoiceList = sink.getData();
          if ( invoiceList.size() < 1 ) {
            System.out.println("No scheduled invoices found for today.");
            return;
          }
          for ( int i = 0; i < invoiceList.size(); i++ ) {
            try {
              Invoice invoice = (Invoice) invoiceList.get(i);
              SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
              Date invPaymentDate = invoice.getPaymentDate();

              //Creates transaction only based on invoices scheduled for today.
              if( dateFormat.format(invPaymentDate).equals(dateFormat.format(new Date())) ){
                System.out.println("Scheduled Invoice for today found.");
                sendValueTransaction(invoice);
              }
            } catch ( Throwable e) {
              e.printStackTrace();
            }
          }
          System.out.println("Cron Completed.");
        } catch ( Throwable e ) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }
    }

    public void sendValueTransaction(Invoice invoice){
      System.out.println("Starting payment process...");
      try {
        Transaction transaction = new Transaction();

        // sets accountId to be used for CICO transaction 
        if ( invoice.getAccountId() != 0 ) {
          transaction.setBankAccountId(invoice.getAccountId());
        }
                
        long invAmount = invoice.getAmount();
        transaction.setPayeeId((Long) invoice.getPayeeId());
        transaction.setPayerId((Long) invoice.getPayerId());
        transaction.setInvoiceId(invoice.getId());
        transaction.setAmount(invAmount);

        try {
          Transaction completedTransaction = (Transaction) localTransactionDAO_.put(transaction);
          invoice.setPaymentId(completedTransaction.getId());
          invoice.setPaymentDate((Date) new Date());
          invoiceDAO_.put(invoice);
          System.out.println("Schedule Transaction Completed.");
        } catch (Throwable e) {
          e.printStackTrace();
          throw new RuntimeException(e);
        }

      } catch ( Throwable e ){
        e.printStackTrace();
      }
    }

    public void start() {
      System.out.println("Scheduled payments on Invoice Cron Starting...");
      localTransactionDAO_ = (DAO) getX().get("localTransactionDAO");
      invoiceDAO_     = (DAO) getX().get("invoiceDAO");
      System.out.println("DAO's fetched...");
      fetchInvoices();
    }
  }
