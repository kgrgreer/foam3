foam.CLASS({
  package: 'net.nanopay.transactionservice.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Transaction Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
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
        return this.ClientDAO.create({
          of: this.Transaction,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/transactionDAO'
          })});
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
    }
  ]
});
