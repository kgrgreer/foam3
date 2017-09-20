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
        return this.EasyDAO({
          daoType: 'MDAO'
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
    }
  ]
});