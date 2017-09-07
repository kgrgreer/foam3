foam.CLASS({
  package: 'net.nanopay.common.dao',
  name: 'Storage',

  documentation: 'Creates all common DAO\'s.',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.b2b.model.Invoice',
    'net.nanopay.common.model.Bank',
    'net.nanopay.transactionservice.model.Transaction'
  ],

  exports: [
    'bankDAO',
    'invoiceDAO',
    'transactionDAO'
  ],

  properties: [
    {
      name: 'bankDAO',
      factory: function() {
        return this.clientDAO({
          of: net.nanopay.common.model.Bank,
          url: 'bankDAO',
          testData: [
            {
              name: 'Bank of Montreal',
              financialId: '001'
            },
            {
              name: 'Scotiabank',
              financialId: '002'
            },
            {
              name: 'Royal Bank of Canada',
              financialId: '003'
            },
            {
              name: 'TD Canada',
              financialId: '004'
            },
            {
              name: 'CIBC',
              financialId: '010'
            },
            {
              name: 'Canadian Bank',
              financialId: '998'
            },
            {
              name: 'Indian Bank',
              financialId: '999'
            }
          ]
        })
      }
    },
    {
      name: 'transactionDAO',
      factory: function() {
        return this.createDAO({
          of: this.Transaction,
          seqNo: true,
          testData: [
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payerId: 1, payeeId: 2, amount: 2300.00, rate: 52.51, fees: 20.00
              },
              {
                referenceNumber: 'CAxxxJZ7', date: '2017 Aug 22', payerId: 1, payeeId: 2, amount: 3200.00, rate: 52.51, fees: 20.00
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