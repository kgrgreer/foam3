foam.CLASS({
  package: 'net.nanopay.invoice.dao',
  name: 'Dao',

  documentation: 'Creates Invoice related DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.invoice.model.Invoice'
  ],

  exports: [
    'invoiceDAO'
  ],

  properties: [
    {
      name: 'invoiceDAO',
      factory: function() {
        return this.EasyDAO.create({
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
    }
  ]
});
