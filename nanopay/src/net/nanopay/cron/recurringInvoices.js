/*
imports invoiceDAO
*/

function recurringInvoiceJob(recurringInvoice){
  var newInv;
  var nid = recurringInvoice.nextInvoiceDay;

  if(recurringInvoice.deleted){
    return;
  } else if (nid > Date.now()){ 
    recurringInvoice.deleted = true;
    return;
  }

  if(nid == Date.now()){
    var invoice = this.Invoice.create();
    return;
  }

  newInv = frequencyCheck(recurringInvoice.frequency, nid);

  
}

function frequencyCheck(frequency, invDate){
  var invoice;
  var currentDay = new Date().getUTCDate();
  var recurringDay = invDate.getDay();
  var recurringDate = invDate.getUTCDate();

  if(frequency == 'Daily'){
    invoice = this.Invoice.create()

  } else if (frequency == 'Weekly' && recurringDay == new Date().getDay()){
    invoice = this.Invoice.create()

  } else if (frequency == 'BiWeekly' && recurringDate > new Date().getDay()){
    invoice = this.Invoice.create()

  } else if (frequency == 'Monthly' && recurringDate > new Date().getMonth()){
    invoice = this.Invoice.create()
  }

  if(invoice){
    this.invoiceDAO.put(invoice);
    return invoice;
  } 
  
  return;
}