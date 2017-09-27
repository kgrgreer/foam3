foam.CLASS({
  package: 'net.nanopay.invoice.model',
  name: 'RecurringInvoice',

  documentation: 'Recurring Invoice model.',

  properties: [
    'id',
    { 
      class: 'String',
      name: 'frequency',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'Daily',
          'Weekly',
          'Biweekly',
          'Monthly'
        ]
      }
    },
    {
      class: 'DateTime',      
      name: 'endsAfter'
    },
    {
      class: 'DateTime',
      name: 'nextInvoiceDate'
    },
    {
      class: 'Boolean',
      name: 'deleted'
    },
    {
      name: 'toUserId'
    },
    {
      name: 'fromUserId'
    }
  ]
});
