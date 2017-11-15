foam.CLASS({
  package: 'net.nanopay.interac.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Main Client for connecting to NANOS server.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'net.nanopay.interac.model.Payee',
    'net.nanopay.fx.model.ExchangeRate',
    'net.nanopay.interac.client.ClientExchangeRateService',
    'foam.nanos.auth.User'
  ],

  exports: [
    'exchangeRate',
    'exchangeRateDAO',
    'payeeDAO'
  ],

  properties: [
    {
      name: 'exchangeRate',
      factory: function () {
        return this.ClientExchangeRateService.create({
          delegate: this.SessionClientBox.create({
            delegate: this.HTTPBox.create({
              method: 'POST',
              url: 'http://localhost:8080/exchangeRate'
            })
          })
        })
      }
    },
    {
      name: 'exchangeRateDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.ExchangeRate,
          serviceName: 'exchangeRateDAO'
        })
      }
    },
    {
      name: 'payeeDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.User,
          serviceName: 'payeeDAO'
        })
      }
    },
    {
      name: 'interacTransactionDAO',
      factory: function() {
        return this.EasyDAO.create({
          daoType: 'CLIENT',
          of: this.User,
          serviceName: 'interacTransactionDAO'
        })
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
