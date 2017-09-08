foam.CLASS({
  package: 'net.nanopay.exchangerate.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Exchange Rate Service Client.',

  requires: [
    'foam.dao.EasyDAO',
    'foam.box.HTTPBox',
    'net.nanopay.exchangerate.model.ExchangeRate',
    'net.nanopay.exchangerate.model.ExchangeRateQuote',
    'net.nanopay.exchangerate.client.ClientExchangeRateService'
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
            method: 'POST',
            url: 'http://localhost:8080/exchangeRate'
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
