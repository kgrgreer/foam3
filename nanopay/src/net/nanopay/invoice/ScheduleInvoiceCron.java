package net.nanopay.cron;

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
import net.nanopay.model.Account;
import static foam.mlang.MLang.*;

public class ScheduleInvoiceCron
  extends    ContextAwareSupport
  {
    protected DAO    invoiceDAO_;
    protected DAO    transactionDAO_;
    protected DAO    userDAO_;
    protected DAO    accountDAO_;

    public void fetchInvoices() {
      try{
        System.out.println("Finding scheduled Invoices...");
        ListSink sink = (ListSink) invoiceDAO_.where(
          AND(
            EQ(Invoice.STATUS, "Scheduled"),
            EQ(Invoice.PAYMENT_ID, 0)
          )
        ).select(new ListSink());
          List invoiceList = sink.getData();
          if ( invoiceList.size() < 1 ) {
            System.out.println("No scheduled invoices found for today.");
            return;
          }
          for ( int i = 0; i < invoiceList.size(); i++ ) {
            Invoice invoice = (Invoice) invoiceList.get(i);
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
            Date invPaymentDate = invoice.getPaymentDate();

            //Creates transaction only based on invoices scheduled for today.
            if( dateFormat.format(invPaymentDate).equals(dateFormat.format(new Date())) ){
              sendValueTransaction(invoice);
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
        Long invAmount = Math.round(invoice.getAmount());
        transaction.setPayeeId((Long) invoice.getPayeeId());
        transaction.setPayerId((Long) invoice.getPayerId());
        transaction.setAmount(invAmount);
        Transaction completedTransaction = (Transaction) transactionDAO_.put(transaction);
        invoice.setPaymentId((Long) completedTransaction.getId());
        invoiceDAO_.put(invoice);
        System.out.println("Schedule Transaction Completed.");
      } catch ( Throwable e ){
        e.printStackTrace();
        throw new RuntimeException(e);
      }
    }

    public void start() {
      System.out.println("Scheduled payments on Invoice Cron Starting...");
      userDAO_        = (DAO) getX().get("userDAO");
      transactionDAO_ = (DAO) getX().get("transactionDAO");
      accountDAO_     = (DAO) getX().get("accountDAO");
      invoiceDAO_     = (DAO) getX().get("invoiceDAO");
      System.out.println("DAO's fetched...");
      fetchInvoices();
    }
  }