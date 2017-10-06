foam.CLASS({
  package: 'net.nanopay.merchant.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Merchant service client',

  requires: [
    'foam.box.HTTPBox',
    'foam.dao.RequestResponseClientDAO',
    'foam.nanos.auth.User',
    'net.nanopay.retail.model.Device',
    'net.nanopay.tx.model.Transaction'
  ],

  exports: [
    'deviceDAO',
    'transactionDAO',
    'userDAO'
  ],

  properties: [
    {
      name: 'deviceDAO',
      factory: function () {
        return this.RequestResponseClientDAO.create({
          of: this.Device,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/deviceDAO'
          })
        });
      }
    },
    {
      name: 'transactionDAO',
      factory: function () {
        return this.RequestResponseClientDAO.create({
          of: this.Transaction,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/transactionDAO'
          })
        });
      }
    },
    {
      name: 'userDAO',
      factory: function () {
        return this.RequestResponseClientDAO.create({
          of: this.User,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/userDAO'
          })
        });
      }
    }
  ]
});