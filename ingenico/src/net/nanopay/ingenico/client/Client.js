foam.CLASS({
  package: 'net.nanopay.ingenico.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  requires: [
    'foam.box.HTTPBox',
    'foam.dao.RequestResponseClientDAO as ClientDAO',
    'net.nanopay.ingenico.client.ClientTransactionService',
    'net.nanopay.transactionservice.model.Transaction'
  ],

  exports: [
    'transaction',
    'transactionDAO'
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
      factory: function () {
        return this.ClientDAO.create({
          of: this.Transaction,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/transactionDAO'
          })
        });
      }
    }
  ]
});