foam.CLASS({
  package: 'net.nanopay.common.dao',
  name: 'Storage',

  documentation: 'Creates all common DAO\'s.',

  requires: [
    'foam.dao.DecoratedDAO',
    'foam.dao.EasyDAO',
    'foam.dao.history.HistoryRecord',
    'net.nanopay.transactionservice.model.Transaction',
    'net.nanopay.b2b.model.Invoice'
  ],

  exports: [
    'transactionDAO',
    'invoiceDAO'
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
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payeeId: 23, amount: 2300.00, rate: 52.51, fees: 20.00
              },
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payeeId: 32, amount: 3200.00, rate: 52.51, fees: 20.00
              }
          ]
        })
        .addPropertyIndex(this.Transaction.REFERENCE_NUMBER)
        .addPropertyIndex(this.Transaction.DATE)
        .addPropertyIndex(this.Transaction.PAYEE_ID)
        .addPropertyIndex(this.Transaction.AMOUNT)
        .addPropertyIndex(this.Transaction.RATE)
        .addPropertyIndex(this.Transaction.FEES)
      }
    },
    {
      name: 'invoiceDAO',
      factory: function() {
        /*this.DecoratedDAO.create({
          decorator: this.InvoiceDecorator.create(),
          delegate: */
        return this.createDAO({
            of: this.Invoice,
            seqNo: true
          })
          .addPropertyIndex(this.Invoice.STATUS)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_NAME)
          .addPropertyIndex(this.Invoice.TO_BUSINESS_ID)
          .addPropertyIndex(this.Invoice.FROM_BUSINESS_ID);
      }
    }
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    },

    function clientDAO(config) {

      var dao = this.ClientDAO.create({
        of: config.of,
        delegate: this.HTTPBox.create({
          method: 'POST',
          url: 'http://localhost:8080/' + config.url
        })
      });

      if ( config.testData ) {
        dao.select(this.COUNT()).then(function (c) {
          if ( c.value == 0 ) {
            for ( var i = 0 ; i < config.testData.length ; i ++ ) {
              dao.put(config.of.create(config.testData[i]));
            }
          }
        });
      }

      return dao;
    }
  ]
});