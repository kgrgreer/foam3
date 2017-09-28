foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Exchange Rate Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'net.nanopay.fx.model.ExchangeRate',
    'net.nanopay.fx.model.ExchangeRateQuote',
    'net.nanopay.fx.client.ClientExchangeRateService'
  ],

  exports: [
    'exchangeRate',
    'exchangeRateDAO'
  ],

  properties: [
    {
      name: 'exchangeRate',
      factory: function () {
        return this.ClientExchangeRateService.create({
          delegate: this.HTTPBox.create({
            url: 'exchangeRate'
          })
        })
      }
    },
    {
      name: 'exchangeRateDAO',
      factory: function() {
        return this.ClientDAO.create({
          of: this.ExchangeRate,
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: 'http://localhost:8080/exchangeRateDAO'
          })});
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
