foam.CLASS({
  package: 'net.nanopay.transactionservice.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Transaction Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'net.nanopay.common.model.Account',
    'net.nanopay.common.model.UserAccountInfo',
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
          daoType: 'CLIENT',
          remoteListenerSupport: true,
          serviceName: 'transactionDAO',
          of: this.Transaction,
        });
      }
    },
    {
      name: 'accountDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.Account,
          serviceName: 'accountDAO',
          seqNo: true,
          testData: [
            {
              id: 1,
              accountInfo: this.UserAccountInfo.create({
                balance: 50000
              })
            },
            {
              id: 2,
              accountInfo: this.UserAccountInfo.create({
                balance: 50000
              })
            }
          ]
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
