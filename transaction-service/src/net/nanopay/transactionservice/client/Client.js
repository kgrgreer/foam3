foam.CLASS({
  package: 'net.nanopay.transactionservice.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Transaction Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'net.nanopay.common.model.Account',
    'net.nanopay.transactionservice.model.Transaction',
    'net.nanopay.transactionservice.client.ClientTransactionService'
  ],

  exports: [
    'transaction',
    'transactionDAO',
    'accountDAO'
  ],

  properties: [
    {
      name: 'transaction',
      factory: function () {
        return this.ClientTransactionService.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/transaction'
          })
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
      name: 'accountDAO',
      factory: function() {
        return this.ClientDAO.create({
          of: net.nanopay.common.model.Account,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/accountDAO'
          })});
      }
    },
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    },

    function clientDAO(config) {
      var dao = this.EasyDAO.create({
        daoType: 'CLIENT',
        of: config.of,
        serviceName: config.url,
      });

      if ( config.seqNo ) {
        dao.seqNo = config.seqNo;
      }

      if ( config.testData ) {
        dao.testData = config.testData;
      }

      return dao;
    }
  ]
});
