foam.CLASS({
  package: 'net.nanopay.invoice.dao',
  name: 'Dao',

  documentation: 'Creates Invoice related DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice',
    'foam.box.HTTPBox'
  ],

  exports: [
    'invoiceDAO',
    'recurringInvoiceDAO'
  ],

  properties: [
    {
      name: 'invoiceDAO',
      factory: function() {
        return this.EasyDAO({
          daoType: 'MDAO',
          of: this.Invoice,
          cache: true,
          seqNo: true,
          testData: [
            {
              status: 'Paid',
              payeeName: 'john',
              payerName: 'ted',
              payeeId: 1,
              payerId: 2,
              amount: 300230,
              invoiceNumber: '403302'
            }
          ]
        })
        .addPropertyIndex(this.Invoice.STATUS)
        .addPropertyIndex(this.Invoice.PAYEE_NAME)
        .addPropertyIndex(this.Invoice.PAYER_NAME)
        .addPropertyIndex(this.Invoice.PAYEE_ID)
        .addPropertyIndex(this.Invoice.PAYER_ID);
      }
    },
    {
      name: 'recurringInvoiceDAO',
      factory: function() {
        return this.createDAO({
          of: this.RecurringInvoice,
          seqNo: true,
          testData: [
            {
              id: 1,
              frequency: 'Daily',
              endsAfter: new Date('2017-11-01'),
              nextInvoiceDay: new Date('2017-07-10'),
              deleted: false,
              payeeId: 1,
              payerId: 2
            },
            {
              id: 2,
              frequency: 'Weekly',
              endsAfter: new Date('2018-12-01'),
              nextInvoiceDay: new Date('2017-09-28'),
              deleted: false,
              payeeId: 1,
              payerId: 2
            },
            {
              id: 3,
              frequency: 'Biweekly',
              endsAfter: new Date('2017-06-01'),
              nextInvoiceDay: new Date('2017-06-01'),
              deleted: false,
              payeeId: 1,
              payerId: 2
            }
          ]
        })
      }
    }
  ]
});
