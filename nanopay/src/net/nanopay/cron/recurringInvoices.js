/*
imports invoiceDAO
*/
class Invoice{
  constructor(payeeId, payerId, amount){
    this.payeeId = payeeId,
    this.payerId = payerId,
    this.amount = amount
  }
}

var recurringInvoices = [
  {
    id: 1,
    frequency: 'Daily',
    endsAfter: new Date('2017-10-01'),
    nextInvoiceDay: new Date('2017-07-10'),
    deleted: false,
    toUserId: 1,
    fromUserId: 2
  },
  {
    id: 2,
    frequency: 'Weekly',
    endsAfter: new Date('2018-12-01'),
    nextInvoiceDay: new Date('2017-09-28'),
    deleted: false,
    toUserId: 1,
    fromUserId: 2
  },
  {
    id: 1,
    frequency: 'Biweekly',
    endsAfter: new Date('2017-06-01'),
    nextInvoiceDay: new Date('2017-06-01'),
    deleted: false,
    toUserId: 1,
    fromUserId: 2
  }
]

recurringInvoices.forEach(function(a){
  recurringInvoiceJob(a);
})

function recurringInvoiceJob(recurringInvoice){
  var newInv;
  var nid = recurringInvoice.nextInvoiceDay;

  if(recurringInvoice.deleted){
    return;
  } else if (recurringInvoice.endsAfter < Date.now()){ 
    recurringInvoice.deleted = true;
    return;
  }

  frequencyCheck(recurringInvoice.frequency, nid); 
}

function frequencyCheck(frequency, invDate){
  var invoice,
      days,
      today = new Date(),
      results;

  if(frequency == 'Daily'){
    invDate.setDate(invDate.getDate() + 1);
    createInvoice(invDate);
  } else if (frequency == 'Weekly'){
    days = 7
  } else if (frequency == 'BiWeekly'){
    days = 14
  } else if (frequency == 'Monthly' ){
    days = 30
  }

  results = recurrance(invDate, today, days);
  if(!results.recur){
    return;
  }
  createInvoice(results.nextDate);
  updateRecurrance(results.nextDate);
}

function createInvoice(nextDate){
  console.log('INVOICE PUT INTO DAO ' + nextDate + ' ' + type)
  console.log('invoice create and recurrancedao items created.')
}

function recurrance(invDate, today, type){
  var days = daysBetween(invDate, today),
      daystill = type - days%type,
      recur = days%type == 0,
      d = new Date();

  d.setDate(d.getDate() + daystill);
  var nextDate = (d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear());

  return {
    recur: recur,
    nextDate: nextDate,
    type: type
  }
}

function convertUTC(date) {
  var utc = new Date(date);
  utc.setMinutes(utc.getMinutes() - utc.getTimezoneOffset());
  return utc;
}

function daysBetween(dateY, dateX) {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((convertUTC(dateX) - convertUTC(dateY)) / millisecondsPerDay);
}