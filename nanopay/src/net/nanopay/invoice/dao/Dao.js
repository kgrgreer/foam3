foam.CLASS({
  package: 'net.nanopay.invoice.dao',
  name: 'Dao',

  documentation: 'Creates Invoice related DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
<<<<<<< HEAD
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice',
    'foam.box.HTTPBox'
=======
    'net.nanopay.invoice.model.Invoice'
>>>>>>> 4687724b9572b2d6f4c4f1987e537baee637071c
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
              toUserName: 'john',
              fromUserName: 'ted',
              toUserId: 1,
              fromUserId: 2,
              amount: 300230,
              invoiceNumber: '403302'
            }
          ]
        })
        .addPropertyIndex(this.Invoice.STATUS)
        .addPropertyIndex(this.Invoice.TO_USER_NAME)
        .addPropertyIndex(this.Invoice.FROM_USER_NAME)
        .addPropertyIndex(this.Invoice.TO_USER_ID)
        .addPropertyIndex(this.Invoice.FROM_USER_ID);
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
              frequency: 'Weekly',
              endsAfter: new Date(),
              nextInvoiceDate: new Date(),
              deleted: false
            }
          ]
        })
      }
    }
  ]
});
