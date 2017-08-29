foam.CLASS({
  package: 'net.nanopay.interac.dao',
  name: 'Storage',

  documentation: 'Creates all Interac DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'foam.dao.history.HistoryRecord',
    'net.nanopay.transactionservice.model.Transaction'
  ],

  exports: [
    'transactionDAO'
  ],

  properties: [
    {
      name: 'transactionDAO',
      factory: function() {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: [
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payeeId: 420, sendingAmount: 2300.00, receivingAmount: 117422.26, rate: 51.12, fees: 20.00
              }
          ]
        })
        .addPropertyIndex(this.Transaction.REFERENCE_NUMBER)
        .addPropertyIndex(this.Transaction.DATE)
        .addPropertyIndex(this.Transaction.PAYEE_ID)
        .addPropertyIndex(this.Transaction.SENDING_AMOUNT)
        .addPropertyIndex(this.Transaction.RECEIVING_AMOUNT)
        .addPropertyIndex(this.Transaction.RATE)
        .addPropertyIndex(this.Transaction.FEES)
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
