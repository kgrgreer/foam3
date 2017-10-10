package net.nanopay.cron;

import foam.core.ContextAwareSupport;
import foam.nanos.pm.PM;
import foam.mlang.MLang;
import foam.dao.DAO;
import java.util.Date;
import java.util.ArrayList;
import foam.core.FObject;
import foam.dao.AbstractSink;
import net.nanopay.invoice.model.RecurringInvoice;
import net.nanopay.invoice.model.Invoice;

public class RecurringInvoiceCron 
  extends    ContextAwareSupport
  implements RecurringInvoiceInterface
  {
    protected DAO    recurringInvoiceDAO_;
    protected DAO    invoiceDAO_;

    public void frequencyCheck(FObject recInv){
      String frequency = recInv.frequency;
      Int days;
      ArrayList<FObject> results;
      Date today = new Date();

      if(frequency == "Daily"){
        createInvoice(recInv);
      } else if (frequency == "Weekly"){
        days = 7;
      } else if (frequency == "BiWeekly"){
        days = 14;
      } else if (frequency == "Monthly"){
        days = 30;
      } 

      results = recurrance(recInv.nextInvoiceDate, today, days);

      if(!results){
        return;
      }

      createInvoice(recInv);
      updateRecurrance(recInv);
    }

    public void createInvoice(FObject recInv){
      System.out.println("Creating New Invoice");
    }
      
    public ArrayList recurrance(Date nid, Date today, Int days){
      Int days = daysBetween(invDate, today);
      Int daystill = type - days%type;
      Int recur = days%type == 0;
      Date d = new Date();
      ArrayList returnData = new ArrayList();

      d.setDate(d.getDate() + daystill);
      Date nextDate = (d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear());
      returnData.add(recur);
      returnData.add(nextDate);
      returnData.add(days);

      return returnData;
    }

    public Int daysBetween(Date dateX, Date dateY){
      Int millisecondsPerDay = 24 * 60 * 60 * 1000;
      return Math.floor((convertUTC(dateX) - convertUTC(dateY)) / millisecondsPerDay);
    }

    public Date convertUTC(Date date){
      Date utc = new Date(date);
      utc.setMinutes(utc.getMinutes() - urc.getTimezoneOffset());
      return utc;
    }

    public void fetchRecurringInvoices() {
      PM pm = new PM(this.getClass(), "fetchRecurringInvoices");

      try{
        recurringInvoiceDAO_.where(
          MLang.AND(
            MLang.EQ(RecurringInvoice.DELETED, false),
            MLang.EQ(RecurringInvoice.ENDS_AFTER >= 1)
          )
        ).select(new ListSink(){
          public void put(ArrayList obj, Detachable sub) {
            for(int i = 0; i < obj.size(); i++){
              frequencyCheck(obj[i]);
            }
          }
        });
      } catch (Throwable e) {
        e.printStackTrace();
        throw new RuntimeException(e);
      }

    }

    @Override
    public void start() {
      System.out.println("Recurring Invoice Cron Starting...");
      recurringInvoiceDAO_ = (DAO) getX().get("recurringInvoiceDAO");
      invoiceDAO_ = (DAO) getX().get("invoiceDAO");

      fetchRecurringInvoices();
    }

  }