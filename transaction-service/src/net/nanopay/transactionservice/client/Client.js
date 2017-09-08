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
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.Transaction,
          serviceName: 'transactionDAO',
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
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: net.nanopay.common.model.Account,
          serviceName: 'accountDAO',
          seqNo: true,
        });
      }
    },
  ],

  methods: [
    function createDAO(config) {
      config.daoType = 'MDAO'; // 'IDB';
      config.cache   = true;

      return this.EasyDAO.create(config);
    }
  ]
});
